"""
CRUD operations for Trek model.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, cast, String
from app.crud.base import CRUDBase
from app.db.models.trek import Trek, TrekImage, ItineraryDay, TrekFAQ, TrekBatch
from app.models.trek import TrekCreate, TrekUpdate, ItineraryDayCreate, TrekImageCreate, TrekFAQCreate


class CRUDTrek(CRUDBase[Trek, TrekCreate, TrekUpdate]):
    """CRUD operations for Trek model."""
    
    def get_with_details(self, db: Session, id: int) -> Optional[Trek]:
        """Get trek with all related data."""
        return db.query(Trek).options(
            joinedload(Trek.itinerary),
            joinedload(Trek.images),
            joinedload(Trek.faqs),
            joinedload(Trek.guide),
            joinedload(Trek.batches),
        ).filter(Trek.id == id).first()

    def get_by_slug_with_details(self, db: Session, slug: str) -> Optional[Trek]:
        """Get trek by slug with all related data."""
        return db.query(Trek).options(
            joinedload(Trek.itinerary),
            joinedload(Trek.images),
            joinedload(Trek.faqs),
            joinedload(Trek.guide),
            joinedload(Trek.batches),
        ).filter(Trek.slug == slug).first()
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        difficulty: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        min_duration: Optional[int] = None,
        max_duration: Optional[int] = None,
        featured: Optional[bool] = None,
        status: Optional[str] = None,
        location: Optional[str] = None,
        search: Optional[str] = None,
        season: Optional[str] = None,
        sort: Optional[str] = None,
    ) -> List[Trek]:
        """Get treks with various filters."""
        query = db.query(Trek)
        
        if difficulty:
            query = query.filter(Trek.difficulty == difficulty)
        if max_price is not None:
            query = query.filter(Trek.price <= max_price)
        if min_price is not None:
            query = query.filter(Trek.price >= min_price)
        if min_duration is not None:
            query = query.filter(Trek.duration >= min_duration)
        if max_duration is not None:
            query = query.filter(Trek.duration <= max_duration)
        if featured is not None:
            query = query.filter(Trek.featured == featured)
        if status:
            query = query.filter(Trek.status == status)
        if location:
            query = query.filter(Trek.location.ilike(f"%{location}%"))
        if search:
            query = query.filter(
                (Trek.name.ilike(f"%{search}%")) |
                (Trek.short_description.ilike(f"%{search}%")) |
                (Trek.location.ilike(f"%{search}%"))
            )
        if season:
            # best_season is JSON array; match if season appears as array element
            query = query.filter(cast(Trek.best_season, String).contains(f'"{season}"'))
        
        # Apply sort
        if sort == "popularity":
            query = query.order_by(Trek.review_count.desc(), Trek.rating.desc())
        elif sort == "price_asc":
            query = query.order_by(Trek.price.asc())
        elif sort == "price_desc":
            query = query.order_by(Trek.price.desc())
        elif sort == "rating":
            query = query.order_by(Trek.rating.desc())
        else:
            # newest (default)
            query = query.order_by(Trek.created_at.desc())
        
        return query.offset(skip).limit(limit).all()
    
    def get_count_with_filters(
        self,
        db: Session,
        *,
        difficulty: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        min_duration: Optional[int] = None,
        max_duration: Optional[int] = None,
        featured: Optional[bool] = None,
        status: Optional[str] = None,
        location: Optional[str] = None,
        search: Optional[str] = None,
        season: Optional[str] = None,
    ) -> int:
        """Get count of treks with filters."""
        query = db.query(func.count(Trek.id))
        
        if difficulty:
            query = query.filter(Trek.difficulty == difficulty)
        if max_price is not None:
            query = query.filter(Trek.price <= max_price)
        if min_price is not None:
            query = query.filter(Trek.price >= min_price)
        if min_duration is not None:
            query = query.filter(Trek.duration >= min_duration)
        if max_duration is not None:
            query = query.filter(Trek.duration <= max_duration)
        if featured is not None:
            query = query.filter(Trek.featured == featured)
        if status:
            query = query.filter(Trek.status == status)
        if location:
            query = query.filter(Trek.location.ilike(f"%{location}%"))
        if search:
            query = query.filter(
                (Trek.name.ilike(f"%{search}%")) |
                (Trek.short_description.ilike(f"%{search}%")) |
                (Trek.location.ilike(f"%{search}%"))
            )
        if season:
            query = query.filter(cast(Trek.best_season, String).contains(f'"{season}"'))
        
        return query.scalar() or 0
    
    def create_with_relations(
        self,
        db: Session,
        *,
        obj_in: TrekCreate
    ) -> Trek:
        """Create trek with itinerary, images, and FAQs."""
        # Extract nested data
        itinerary_data = obj_in.itinerary or []
        images_data = obj_in.images or []
        faqs_data = obj_in.faqs or []
        
        # Create trek without nested data
        trek_data = obj_in.model_dump(exclude={"itinerary", "images", "faqs"})
        db_trek = Trek(**trek_data)
        db.add(db_trek)
        db.flush()  # Get the ID
        
        # Create itinerary days
        for day_data in itinerary_data:
            db_day = ItineraryDay(**day_data.model_dump(), trek_id=db_trek.id)
            db.add(db_day)
        
        # Create images
        for img_data in images_data:
            db_img = TrekImage(**img_data.model_dump(), trek_id=db_trek.id)
            db.add(db_img)
        
        # Create FAQs
        for faq_data in faqs_data:
            db_faq = TrekFAQ(**faq_data.model_dump(), trek_id=db_trek.id)
            db.add(db_faq)
        
        db.commit()
        db.refresh(db_trek)
        return db_trek
    
    def update_with_relations(
        self,
        db: Session,
        *,
        db_obj: Trek,
        obj_in: TrekUpdate
    ) -> Trek:
        """Update trek with itinerary and FAQs."""
        # Extract nested data
        itinerary_data = obj_in.itinerary
        faqs_data = obj_in.faqs
        
        # Update trek fields
        update_data = obj_in.model_dump(exclude={"itinerary", "faqs"}, exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        # Replace itinerary if provided
        if itinerary_data is not None:
            # Delete existing itinerary
            db.query(ItineraryDay).filter(ItineraryDay.trek_id == db_obj.id).delete()
            
            # Create new itinerary days
            for day_data in itinerary_data:
                db_day = ItineraryDay(**day_data.model_dump(), trek_id=db_obj.id)
                db.add(db_day)
        
        # Replace FAQs if provided
        if faqs_data is not None:
            # Delete existing FAQs
            db.query(TrekFAQ).filter(TrekFAQ.trek_id == db_obj.id).delete()
            
            # Create new FAQs
            for faq_data in faqs_data:
                db_faq = TrekFAQ(**faq_data.model_dump(), trek_id=db_obj.id)
                db.add(db_faq)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def publish(self, db: Session, *, db_obj: Trek) -> Trek:
        """Publish a trek."""
        db_obj.status = "published"
        db_obj.published_at = datetime.utcnow()
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def unpublish(self, db: Session, *, db_obj: Trek) -> Trek:
        """Unpublish a trek (set to draft)."""
        db_obj.status = "draft"
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def archive(self, db: Session, *, db_obj: Trek) -> Trek:
        """Archive a trek."""
        db_obj.status = "archived"
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def restore(self, db: Session, *, db_obj: Trek) -> Trek:
        """Restore an archived trek to draft."""
        db_obj.status = "draft"
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def duplicate(self, db: Session, *, db_obj: Trek) -> Trek:
        """Duplicate a trek."""
        # Create new trek with same data
        new_trek = Trek(
            name=f"{db_obj.name} (Copy)",
            slug=f"{db_obj.slug}-copy-{int(datetime.utcnow().timestamp())}",
            short_description=db_obj.short_description,
            description=db_obj.description,
            difficulty=db_obj.difficulty,
            duration=db_obj.duration,
            max_altitude=db_obj.max_altitude,
            distance=db_obj.distance,
            price=db_obj.price,
            featured_image=db_obj.featured_image,
            gallery=db_obj.gallery,
            status="draft",  # Always start as draft
            featured=False,
            location=db_obj.location,
            best_season=db_obj.best_season,
            group_size_min=db_obj.group_size_min,
            group_size_max=db_obj.group_size_max,
            includes=db_obj.includes,
            excludes=db_obj.excludes,
            equipment_list=db_obj.equipment_list,
            fitness_level=db_obj.fitness_level,
            experience_required=db_obj.experience_required,
            meta_title=db_obj.meta_title,
            meta_description=db_obj.meta_description,
            meta_keywords=db_obj.meta_keywords,
            map_embed=db_obj.map_embed,
            guide_id=db_obj.guide_id,
        )
        db.add(new_trek)
        db.flush()
        
        # Copy itinerary
        for day in db_obj.itinerary:
            new_day = ItineraryDay(
                trek_id=new_trek.id,
                day=day.day,
                title=day.title,
                description=day.description,
                elevation_gain=day.elevation_gain,
                distance=day.distance,
                accommodation=day.accommodation,
                meals=day.meals,
                highlights=day.highlights,
            )
            db.add(new_day)
        
        # Copy FAQs
        for faq in db_obj.faqs:
            new_faq = TrekFAQ(
                trek_id=new_trek.id,
                question=faq.question,
                answer=faq.answer,
                display_order=faq.display_order,
            )
            db.add(new_faq)
        
        db.commit()
        db.refresh(new_trek)
        return new_trek
    
    def add_itinerary_day(
        self,
        db: Session,
        *,
        trek_id: int,
        day_in: ItineraryDayCreate
    ) -> ItineraryDay:
        """Add an itinerary day to a trek."""
        db_day = ItineraryDay(**day_in.model_dump(), trek_id=trek_id)
        db.add(db_day)
        db.commit()
        db.refresh(db_day)
        return db_day
    
    def add_image(
        self,
        db: Session,
        *,
        trek_id: int,
        image_in: TrekImageCreate
    ) -> TrekImage:
        """Add an image to a trek."""
        db_img = TrekImage(**image_in.model_dump(), trek_id=trek_id)
        db.add(db_img)
        db.commit()
        db.refresh(db_img)
        return db_img


trek_crud = CRUDTrek(Trek)
