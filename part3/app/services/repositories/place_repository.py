from app.models.place import Place
from app.persistence.repository import SQLAlchemyRepository

class PlaceRepository(SQLAlchemyRepository):
    def __init__(self, model):
        super().__init__(model)
