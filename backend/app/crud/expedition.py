"""
CRUD operations for Expedition model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.db.models.expedition import Expedition, ExpeditionDay
from app.models.expedition import ExpeditionCreate, ExpeditionUpdate, ExpeditionDayCreate


class CRUDExpedition(CRUDBase[Expedition, ExpeditionCreate, ExpeditionUpdate]):
    """CRUD operations for Expedition model."""
    
    def get_with_details(self, db: Session, id: int) -> Optional[Expedition]:
        """Get expedition with all related data."""
        return db.query(Expedition).options(
            joinedload(Expedition.itinerary)
        ).filter(Expedition.id == id).first()
    
    def get_by_slug_with_details(self, db: Session, slug: str) -> Optional[Expedition]:
        """Get expedition by slug with all related data."""
        return db.query(Expedition).options(
            joinedload(Expedition.itinerary)
        ).filter(Expedition.slug == slug).first()
    
    def get_by_slug(self, db: Session, slug: str) -> Optional[Expedition]:
        """Get expedition by slug."""
        return db.query(Expedition).filter(Expedition.slug == slug).first()
    
    def get_featured(self, db: Session, limit: int = 4) -> List[Expedition]:
        """Get featured expeditions."""
        return db.query(Expedition).filter(
            Expedition.featured == True,
            Expedition.status == "published"
        ).limit(limit).all()
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        difficulty: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        featured: Optional[bool] = None,
        region: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Expedition]:
        """Get expeditions with various filters."""
        query = db.query(Expedition)
        
        if difficulty:
            query = query.filter(Expedition.difficulty == difficulty)
        if max_price is not None:
            query = query.filter(Expedition.price <= max_price)
        if min_price is not None:
            query = query.filter(Expedition.price >= min_price)
        if featured is not None:
            query = query.filter(Expedition.featured == featured)
        if region:
            query = query.filter(Expedition.region.ilike(f"%{region}%"))
        if status:
            query = query.filter(Expedition.status == status)
        if search:
            query = query.filter(
                Expedition.name.ilike(f"%{search}%") |
                Expedition.location.ilike(f"%{search}%") |
                Expedition.region.ilike(f"%{search}%")
            )
        
        return query.order_by(Expedition.updated_at.desc()).offset(skip).limit(limit).all()
    
    def get_count_with_filters(
        self,
        db: Session,
        *,
        difficulty: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        featured: Optional[bool] = None,
        region: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> int:
        """Get count of expeditions with filters."""
        from sqlalchemy import func
        query = db.query(func.count(Expedition.id))
        
        if difficulty:
            query = query.filter(Expedition.difficulty == difficulty)
        if max_price is not None:
            query = query.filter(Expedition.price <= max_price)
        if min_price is not None:
            query = query.filter(Expedition.price >= min_price)
        if featured is not None:
            query = query.filter(Expedition.featured == featured)
        if region:
            query = query.filter(Expedition.region.ilike(f"%{region}%"))
        if status:
            query = query.filter(Expedition.status == status)
        if search:
            query = query.filter(
                Expedition.name.ilike(f"%{search}%") |
                Expedition.location.ilike(f"%{search}%") |
                Expedition.region.ilike(f"%{search}%")
            )
        
        return query.scalar() or 0
    
    def create_with_relations(
        self,
        db: Session,
        *,
        obj_in: ExpeditionCreate
    ) -> Expedition:
        """Create expedition with itinerary."""
        # Extract nested data
        itinerary_data = obj_in.itinerary or []
        
        # Create expedition data dict
        exp_data = obj_in.model_dump(exclude={"itinerary"}, by_alias=False)
        
        # Map aliased fields to DB fields
        if "summitAltitude" in exp_data:
            exp_data["summit_altitude"] = exp_data.pop("summitAltitude")
        if "baseAltitude" in exp_data:
            exp_data["base_altitude"] = exp_data.pop("baseAltitude")
        if "shortDescription" in exp_data:
            exp_data["short_description"] = exp_data.pop("shortDescription")
        if "successRate" in exp_data:
            exp_data["success_rate"] = exp_data.pop("successRate")
        if "safetyInfo" in exp_data:
            exp_data["safety_info"] = exp_data.pop("safetyInfo")
        if "reviewCount" in exp_data:
            exp_data["review_count"] = exp_data.pop("reviewCount")
        if "itineraryPdfUrl" in exp_data:
            exp_data["itinerary_pdf_url"] = exp_data.pop("itineraryPdfUrl")
        
        # Convert nested models to dict
        if "requirements" in exp_data and hasattr(exp_data["requirements"], "model_dump"):
            exp_data["requirements"] = exp_data["requirements"].model_dump()
        if "equipment" in exp_data and hasattr(exp_data["equipment"], "model_dump"):
            exp_data["equipment"] = exp_data["equipment"].model_dump()
        
        db_exp = Expedition(**exp_data)
        db.add(db_exp)
        db.flush()
        
        # Create itinerary days
        for day_data in itinerary_data:
            day_dict = day_data.model_dump() if hasattr(day_data, "model_dump") else day_data
            db_day = ExpeditionDay(**day_dict, expedition_id=db_exp.id)
            db.add(db_day)
        
        db.commit()
        db.refresh(db_exp)
        return db_exp
    
    def update_with_relations(
        self,
        db: Session,
        *,
        db_obj: Expedition,
        obj_in: ExpeditionUpdate
    ) -> Expedition:
        """Update expedition with itinerary."""
        # Get update data, excluding None values
        update_data = obj_in.model_dump(exclude_unset=True, by_alias=False)
        
        # Map aliased fields to DB fields
        if "summitAltitude" in update_data:
            update_data["summit_altitude"] = update_data.pop("summitAltitude")
        if "baseAltitude" in update_data:
            update_data["base_altitude"] = update_data.pop("baseAltitude")
        if "shortDescription" in update_data:
            update_data["short_description"] = update_data.pop("shortDescription")
        if "successRate" in update_data:
            update_data["success_rate"] = update_data.pop("successRate")
        if "safetyInfo" in update_data:
            update_data["safety_info"] = update_data.pop("safetyInfo")
        if "reviewCount" in update_data:
            update_data["review_count"] = update_data.pop("reviewCount")
        if "itineraryPdfUrl" in update_data:
            update_data["itinerary_pdf_url"] = update_data.pop("itineraryPdfUrl")
        
        # Handle itinerary separately if provided
        itinerary_data = update_data.pop("itinerary", None)
        
        # Convert nested models to dict
        if "requirements" in update_data and hasattr(update_data["requirements"], "model_dump"):
            update_data["requirements"] = update_data["requirements"].model_dump()
        if "equipment" in update_data and hasattr(update_data["equipment"], "model_dump"):
            update_data["equipment"] = update_data["equipment"].model_dump()
        
        # Update expedition fields
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        # Update itinerary if provided
        if itinerary_data is not None:
            # Delete existing itinerary
            db.query(ExpeditionDay).filter(
                ExpeditionDay.expedition_id == db_obj.id
            ).delete()
            
            # Create new itinerary
            for day_data in itinerary_data:
                day_dict = day_data.model_dump() if hasattr(day_data, "model_dump") else day_data
                db_day = ExpeditionDay(**day_dict, expedition_id=db_obj.id)
                db.add(db_day)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def duplicate(self, db: Session, id: int) -> Optional[Expedition]:
        """Duplicate an expedition."""
        original = self.get_with_details(db, id)
        if not original:
            return None
        
        # Create new expedition data
        new_exp = Expedition(
            name=f"{original.name} (Copy)",
            slug=f"{original.slug}-copy-{int(db.query(Expedition).count()) + 1}",
            difficulty=original.difficulty,
            duration=original.duration,
            summit_altitude=original.summit_altitude,
            base_altitude=original.base_altitude,
            location=original.location,
            region=original.region,
            description=original.description,
            short_description=original.short_description,
            highlights=original.highlights,
            requirements=original.requirements,
            equipment=original.equipment,
            price=original.price,
            group_size_min=original.group_size_min,
            group_size_max=original.group_size_max,
            season=original.season,
            success_rate=original.success_rate,
            image=original.image,
            gallery=original.gallery,
            safety_info=original.safety_info,
            rating=0.0,
            review_count=0,
            featured=False,
            status="draft",
            itinerary_pdf_url=original.itinerary_pdf_url,
        )
        
        db.add(new_exp)
        db.flush()
        
        # Copy itinerary
        for day in original.itinerary:
            new_day = ExpeditionDay(
                expedition_id=new_exp.id,
                day=day.day,
                title=day.title,
                description=day.description,
                altitude=day.altitude,
                activities=day.activities,
            )
            db.add(new_day)
        
        db.commit()
        db.refresh(new_exp)
        return new_exp


expedition_crud = CRUDExpedition(Expedition)

