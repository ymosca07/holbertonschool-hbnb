from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import (jwt_required, get_jwt_identity)

api = Namespace('admin', description='Admin operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})

# Define the amenity model for input validation and documentation
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})

# Define the place model for input validation and documentation
place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'owner_id': fields.String(description='ID of the owner'),
    'owner': fields.Nested(user_model, description='Owner details'),
    'amenities': fields.List(fields.String, required=True, description="List of amenities ID's")
})

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


@api.route('/users/')
class AdminUserCreate(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User created by admin')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Register a user by admin"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        user_data = api.payload
        email = user_data.get('email')

        # Check if email is already in use
        if facade.get_user_by_email(email):
            return {'error': 'Email already registered'}, 400

        password = user_data.get('password')

        try:
            new_user = facade.create_user(user_data)
            new_user.hash_password(password)
            return new_user.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400


@api.route('/users/<user_id>')
class AdminUserModify(Resource):
    @api.expect(user_model)
    @api.response(200, 'User updated successfully')
    @api.response(400, 'Invalid input data / Email is already in use')
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'User not found')
    @jwt_required()
    def put(self, user_id):
        """Update a User by an Admin"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        user_data = api.payload
        if not user_data:
            return {'error': 'Invalid input data'}, 400

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        email = user_data.get('email')

        if email:
            # Check if email is already in use
            existing_user = facade.get_user_by_email(email)
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email is already in use'}, 400

        try:
            facade.update_user(user_id, user_data)
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400


@api.route('/amenities/')
class AdminAmenityCreate(Resource):
    @api.expect(amenity_model)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Create an amenity by an Admin"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        amenity_data = api.payload

        existing_amenity = facade.amenity_repo.get_by_attribute('name', amenity_data.get('name'))
        if existing_amenity:
            return {'error': 'Invalid input data'}, 400

        try:
            new_amenity = facade.create_amenity(amenity_data)
            return new_amenity.to_dict(), 201

        except Exception as e:
            return {'error': str(e)}, 400


@api.route('/amenities/<amenity_id>')
class AdminAmenityModify(Resource):
    @api.expect(amenity_model)
    @api.response(200, 'Amenity updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'Amenity not found')
    @jwt_required()
    def put(self, amenity_id):
        """Modify an amenity"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        amenity_data = api.payload

        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404

        try:
            facade.update_amenity(amenity_id, amenity_data)
            return {"message": "Amenity updated successfully"}, 200

        except Exception as e:
            return {'error': str(e)}, 400


@api.route('/places/<place_id>')
class AdminPlaceModify(Resource):
    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action.')
    @api.response(404, 'Place not found')
    @jwt_required()
    def put(self, place_id):
        """Modify a place by an Admin"""

        current_user = get_jwt_identity()

        # Set is_admin default to False if not exists
        is_admin = current_user.get('is_admin', False)
        if not is_admin:
            return {'error': 'Unauthorized action'}, 403

        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        place_data = api.payload

        try:
            facade.update_place(place_id, place_data)
            return {'message': 'Place updated successfully'}, 200

        except Exception as e:
            return {'error': str(e)}, 400


@api.route('/reviews/<review_id>')
class AdminReviewModify(Resource):
    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'Review not found')
    @jwt_required()
    def put(self, review_id):
        """Update a review's information"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404


        review_data = api.payload


        try:
            facade.update_review(review_id, review_data)
            return {'message': 'Review updated successfully'}, 200

        except Exception as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Review deleted successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        """Delete a review by an Admin"""

        current_user = get_jwt_identity()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        try:
            facade.delete_review(review_id)
            return {'message': 'Review deleted successfully'}, 200

        except Exception as e:
            return {'error': str(e)}, 400
