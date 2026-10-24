"""
CRUD operations for DepartureCity and its routes.
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session, selectinload

from app.crud.base import CRUDBase
from app.db.models.marketing import CityRoute, DepartureCity
from app.models.marketing import CityRouteIn, DepartureCityCreate, DepartureCityUpdate


class CRUDDepartureCity(CRUDBase[DepartureCity, DepartureCityCreate, DepartureCityUpdate]):
    """CRUD operations for departure cities; routes are replaced as a whole on update."""

    def _query(self, db: Session):
        return db.query(DepartureCity).options(selectinload(DepartureCity.routes))

    def get_with_routes(self, db: Session, id: int) -> Optional[DepartureCity]:
        return self._query(db).filter(DepartureCity.id == id).first()

    def get_by_slug_with_routes(self, db: Session, slug: str) -> Optional[DepartureCity]:
        return self._query(db).filter(DepartureCity.slug == slug).first()

    def list_all(self, db: Session, *, published_only: bool = False) -> List[DepartureCity]:
        query = self._query(db)
        if published_only:
            query = query.filter(DepartureCity.is_published.is_(True))
        return query.order_by(DepartureCity.display_order.asc(), DepartureCity.name.asc()).all()

    @staticmethod
    def _build_routes(routes: List[CityRouteIn]) -> List[CityRoute]:
        return [
            CityRoute(**{**route.model_dump(), "display_order": index})
            for index, route in enumerate(routes)
        ]

    def build(self, obj_in: DepartureCityCreate) -> DepartureCity:
        """Build an unsaved city so the quality gate can run before commit."""
        data = obj_in.model_dump(exclude={"routes"}, mode="json")
        data["last_verified"] = obj_in.last_verified
        city = DepartureCity(**data)
        city.routes = self._build_routes(obj_in.routes)
        if city.is_published:
            city.published_at = datetime.utcnow()
        return city

    def apply_update(self, city: DepartureCity, obj_in: DepartureCityUpdate) -> None:
        """Apply changes in memory (no commit) so the quality gate can check the result."""
        data = obj_in.model_dump(exclude={"routes"}, exclude_unset=True, mode="json")
        if "last_verified" in data:
            data["last_verified"] = obj_in.last_verified
        was_published = city.is_published
        for field, value in data.items():
            setattr(city, field, value)
        if obj_in.routes is not None:
            city.routes = self._build_routes(obj_in.routes)
        if city.is_published and not was_published:
            city.published_at = datetime.utcnow()


departure_city_crud = CRUDDepartureCity(DepartureCity)
