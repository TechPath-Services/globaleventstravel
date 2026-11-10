"""
Meta (WhatsApp Cloud API / Coexistence + Lead Ads) webhook for Global Events Travels.

- GET  /webhook  -> Meta verification handshake (echo hub.challenge)
- POST /webhook  -> receives events, verifies X-Hub-Signature-256, extracts lead data
                    (name, phone, message, ad referral) and forwards it to FORWARD_URL.
- GET  /health   -> simple health check
"""
import hashlib
import hmac
import json
import logging
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

load_dotenv()

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "")
APP_SECRET = os.getenv("META_APP_SECRET", "")
FORWARD_URL = os.getenv("FORWARD_URL", "")
FORWARD_RAW = os.getenv("FORWARD_RAW", "false").lower() == "true"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("meta-webhook")

app = FastAPI(title="Global Events Travels - Meta Ads Webhook")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/webhook", response_class=PlainTextResponse)
def verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and VERIFY_TOKEN and hub_verify_token == VERIFY_TOKEN:
        log.info("Webhook verified by Meta")
        return PlainTextResponse(content=hub_challenge or "", status_code=200)
    raise HTTPException(status_code=403, detail="Verification failed")


def _valid_signature(raw_body: bytes, header: str | None) -> bool:
    if not APP_SECRET:
        log.warning("META_APP_SECRET not set - skipping signature check")
        return True
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header.split("=", 1)[1])


def extract_whatsapp_leads(payload: dict) -> list[dict[str, Any]]:
    """Turn a WhatsApp Business Account webhook payload into flat lead records."""
    leads: list[dict[str, Any]] = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {}) or {}
            field = change.get("field")
            contacts = {c.get("wa_id"): c for c in value.get("contacts", []) or []}
            business_phone = (value.get("metadata") or {}).get("display_phone_number")

            # Incoming messages (also "smb_message_echoes" etc. are ignored here)
            for msg in value.get("messages", []) or []:
                wa_id = msg.get("from")
                contact = contacts.get(wa_id, {})
                referral = msg.get("referral") or {}
                msg_type = msg.get("type")
                text = None
                if msg_type == "text":
                    text = (msg.get("text") or {}).get("body")
                elif msg_type == "button":
                    text = (msg.get("button") or {}).get("text")
                elif msg_type == "interactive":
                    inter = msg.get("interactive") or {}
                    text = (inter.get("button_reply") or inter.get("list_reply") or {}).get("title")

                leads.append({
                    "source": "whatsapp",
                    "field": field,
                    "waba_id": entry.get("id"),
                    "business_phone": business_phone,
                    "name": (contact.get("profile") or {}).get("name"),
                    "phone": wa_id,
                    "message_id": msg.get("id"),
                    "message_type": msg_type,
                    "message": text,
                    "timestamp": msg.get("timestamp"),
                    "from_ad": bool(referral),
                    "ad_id": referral.get("source_id"),
                    "ad_source_type": referral.get("source_type"),
                    "ad_source_url": referral.get("source_url"),
                    "ad_headline": referral.get("headline"),
                    "ad_body": referral.get("body"),
                    "ctwa_clid": referral.get("ctwa_clid"),
                    "trek": guess_trek(text, referral),
                })
    return leads


def extract_leadgen(payload: dict) -> list[dict[str, Any]]:
    """Page 'leadgen' events (Instant Form leads). Fetch full lead with Graph API using leadgen_id."""
    leads = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            if change.get("field") != "leadgen":
                continue
            v = change.get("value", {}) or {}
            leads.append({
                "source": "lead_form",
                "page_id": v.get("page_id"),
                "leadgen_id": v.get("leadgen_id"),
                "form_id": v.get("form_id"),
                "ad_id": v.get("ad_id"),
                "adgroup_id": v.get("adgroup_id"),
                "created_time": v.get("created_time"),
            })
    return leads


TREKS = ["Kheerganga", "Kedarkantha", "Kuari Pass", "Hampta", "Sar Pass", "Bali Pass"]


def guess_trek(text: str | None, referral: dict) -> str | None:
    hay = " ".join(filter(None, [text, referral.get("headline"), referral.get("body")])).lower()
    for trek in TREKS:
        if trek.lower() in hay:
            return trek
    return None


async def forward(data: dict) -> None:
    if not FORWARD_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(FORWARD_URL, json=data)
            log.info("Forwarded to %s -> %s", FORWARD_URL, r.status_code)
    except Exception as exc:  # noqa: BLE001
        log.error("Forward failed: %s", exc)


@app.post("/webhook")
async def receive(request: Request, background: BackgroundTasks):
    raw = await request.body()
    if not _valid_signature(raw, request.headers.get("X-Hub-Signature-256")):
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(raw or b"{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    obj = payload.get("object")
    if obj == "whatsapp_business_account":
        leads = extract_whatsapp_leads(payload)
    elif obj == "page":
        leads = extract_leadgen(payload)
    else:
        leads = []

    for lead in leads:
        log.info("Lead: %s", lead)
        background.add_task(forward, {"lead": lead, **({"raw": payload} if FORWARD_RAW else {})})

    # Always ACK fast so Meta doesn't retry
    return {"status": "received", "leads": len(leads)}
