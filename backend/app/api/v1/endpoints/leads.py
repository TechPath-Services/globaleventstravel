"""
Lead API endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.config import settings
from app.crud.lead import lead_crud
from app.crud.trek import trek_crud
from app.crud.expedition import expedition_crud
from app.models.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse
from app.models.common import PaginatedResponse, MessageResponse
from app.services.email import send_lead_notification, send_itinerary_to_user
from app.crud.email_log import email_log_crud

router = APIRouter()


@router.get("", response_model=PaginatedResponse[LeadListResponse])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(None),
    status: Optional[str] = Query(None, pattern="^(new|contacted|converted|lost)$"),
    source: Optional[str] = Query(None, max_length=50),
    db: Session = Depends(get_db),
):
    """Get list of leads with optional status and source filters."""
    if limit is None:
        limit = settings.DEFAULT_PAGE_SIZE
    limit = min(limit, settings.MAX_PAGE_SIZE)
    
    filters = {}
    if status:
        filters["status"] = status
    if source:
        filters["source"] = source
    
    leads = lead_crud.get_multi(db, skip=skip, limit=limit, filters=filters)
    total = lead_crud.get_count(db, filters=filters)
    
    return PaginatedResponse(
        items=[LeadListResponse.model_validate(l) for l in leads],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/new", response_model=List[LeadListResponse])
def list_new_leads(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get new/uncontacted leads (most recent first)."""
    leads = lead_crud.get_new_leads(db, limit=limit)
    return [LeadListResponse.model_validate(l) for l in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
):
    """Get a lead by ID."""
    lead = lead_crud.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)


def _run_lead_automation(
    lead_id: int,
    name: str,
    email: Optional[str],
    whatsapp: str,
    trek_slug: str,
    trek_name: Optional[str],
    interest_type: str,
    source: str,
):
    """Background task: notify admin and send itinerary to user."""
    from app.db.session import SessionLocal

    interest_name = trek_name or trek_slug
    db = SessionLocal()

    try:
        # 1. Send lead notification to admin
        msg_id = send_lead_notification(
            name=name,
            email=email,
            whatsapp=whatsapp,
            interest_type=interest_type,
            interest_name=interest_name,
            source=source,
            lead_id=lead_id,
        )
        if settings.ADMIN_EMAIL:
            email_log_crud.create_from_send(
                db,
                recipient_email=settings.ADMIN_EMAIL,
                subject=f"New Lead: {interest_name}",
                email_type="lead_notification",
                lead_id=lead_id,
                brevo_message_id=msg_id,
                tags=["lead_notification"],
                status="sent" if msg_id else "error",
            )

        # 2. Resolve PDF URL and send itinerary to user (only when email provided)
        if email and settings.BREVO_API_KEY:
            pdf_url = None
            if interest_type == "trek" and trek_slug != "custom":
                trek = trek_crud.get_by_slug(db, trek_slug)
                if trek and hasattr(trek, "itinerary_pdf_url"):
                    pdf_url = trek.itinerary_pdf_url
            elif interest_type == "expedition":
                expedition = expedition_crud.get_by_slug(db, trek_slug)
                if expedition and hasattr(expedition, "itinerary_pdf_url"):
                    pdf_url = expedition.itinerary_pdf_url

            msg_id2 = send_itinerary_to_user(
                name=name,
                email=email,
                interest_name=interest_name,
                interest_type=interest_type,
                pdf_url=pdf_url,
                lead_id=lead_id,
            )
            email_log_crud.create_from_send(
                db,
                recipient_email=email,
                subject=f"Your {interest_name} Itinerary",
                email_type="itinerary",
                lead_id=lead_id,
                brevo_message_id=msg_id2,
                tags=["itinerary"],
                status="sent" if msg_id2 else "error",
            )
    finally:
        db.close()


@router.post("", response_model=LeadResponse, status_code=201)
def create_lead(
    lead_in: LeadCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Create a new lead.

    This endpoint is called when a user submits a lead capture form on the frontend
    (e.g., hero section form, trek page form, mobile sticky form).
    Automatically: notifies admin, sends itinerary to user if PDF exists.
    """
    interest_type = getattr(lead_in, "interest_type", None) or "trek"

    # Try to get trek/expedition name if not provided
    if not lead_in.trek_name and lead_in.trek_slug != "custom":
        if interest_type == "expedition":
            expedition = expedition_crud.get_by_slug(db, lead_in.trek_slug)
            if expedition:
                lead_in.trek_name = expedition.name
        else:
            trek = trek_crud.get_by_slug(db, lead_in.trek_slug)
            if trek:
                lead_in.trek_name = trek.name

    lead = lead_crud.create(db, obj_in=lead_in)
    lead_resp = LeadResponse.model_validate(lead)

    interest_type = getattr(lead, "interest_type", None) or "trek"

    # Run email automation in background
    background_tasks.add_task(
        _run_lead_automation,
        lead_id=lead.id,
        name=lead.name,
        email=lead.email,
        whatsapp=lead.whatsapp,
        trek_slug=lead.trek_slug,
        trek_name=lead.trek_name,
        interest_type=interest_type,
        source=lead.source,
    )

    return lead_resp


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
):
    """Update a lead (typically status or notes)."""
    lead = lead_crud.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead = lead_crud.update(db, db_obj=lead, obj_in=lead_in)
    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}/itinerary-sent", response_model=LeadResponse)
def mark_itinerary_sent(
    lead_id: int,
    db: Session = Depends(get_db),
):
    """Mark that itinerary has been sent to the lead."""
    lead = lead_crud.mark_itinerary_sent(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
):
    """Delete a lead."""
    lead = lead_crud.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead_crud.remove(db, id=lead_id)
    return {"message": "Lead deleted successfully"}

