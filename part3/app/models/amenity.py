from app import db
from .basemodel import BaseModel

class Amenity(BaseModel):

    __tablename__ = 'amenities'

    _id = db.Column(db.Integer, primary_key=True)
    _name = db.Column(db.String(100), nullable=False)

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if not value:
            raise ValueError("Name cannot be empty")
        super().is_max_length('Name', value, 50)
        self._name = value

    def update(self, data):
        return super().update(data)

    def to_dict(self):
        return {
			'id': self.id,
			'name': self.name
		}
