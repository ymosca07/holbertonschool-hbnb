from sqlalchemy import Table, Column, ForeignKey
from app import db

place_amenity = Table(
    'place_amenity',
    db.Model.metadata,
    Column('place_id', db.String(36), ForeignKey('places.id'), primary_key=True),
    Column('amenity_id', db.String(36), ForeignKey('amenities.id'), primary_key=True)
)