from app.models.amenity import Amenity
from app.persistence.repository import SQLAlchemyRepository

class AmenityRepository(SQLAlchemyRepository):
    def __init__(self, model):
        super().__init__(model)
