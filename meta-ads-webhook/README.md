# Meta Ads Webhook (Global Events Travels)

FastAPI service that receives WhatsApp (Cloud API / Coexistence) and Lead Ads webhooks from Meta,
extracts lead data (name, phone, first message, which ad) and forwards it to `FORWARD_URL`.

## Run locally
```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # then fill values
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Endpoints
- `GET /webhook` – Meta verification (returns `hub.challenge` as plain text when `hub.verify_token` matches `META_VERIFY_TOKEN`)
- `POST /webhook` – events; checks `X-Hub-Signature-256` with `META_APP_SECRET`, always replies 200 fast
- `GET /health`

## Test
```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=getrek_2026&hub.challenge=123"
curl -X POST http://localhost:8000/webhook -H "Content-Type: application/json" -d @sample_payload.json
```
(Leave `META_APP_SECRET` empty for local curl tests, since curl doesn't sign the body.)

## Forwarded lead format
```json
{"lead": {"source": "whatsapp", "name": "Test User", "phone": "919999999999",
  "message": "Hi! I'm interested in Kheerganga Trek...", "from_ad": true,
  "ad_id": "120250840731510254", "ad_headline": "Kheerganga Trek – From ₹2,999",
  "trek": "Kheerganga", "ctwa_clid": "TEST_CLID", ...}}
```

## Meta setup
1. Meta App > WhatsApp > Configuration > Callback URL `https://<your-domain>/webhook`, Verify token = `META_VERIFY_TOKEN`.
2. Subscribe to the `messages` field (and `leadgen` on the Page for Instant Form leads).
3. For lead forms, fetch full answers with `GET /{leadgen_id}?access_token=...` using `leadgen_id`.
