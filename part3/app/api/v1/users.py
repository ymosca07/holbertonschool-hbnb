from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import (jwt_required, get_jwt_identity)
from flask import request

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})

@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""
        user_data = api.payload

        # Simulate email uniqueness check (to be replaced by real validation with persistence)
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400

        try:
            new_user = facade.create_user(user_data)
            new_user.hash_password(user_data['password'])
            return new_user.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400
        
    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Retrieve a list of users"""
        users = facade.get_users()
        return [user.to_dict() for user in users], 200
    
@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict(), 200

    @api.expect(user_model)
    @api.response(200, 'User updated successfully')
    @api.response(404, 'User not found')
    @api.param('Authorization', 'Bearer <token>', type='string', location='header')
    @jwt_required()
    @api.response(400, 'Invalid input data')
    def put(self, user_id):
        from app import bcrypt
        
        user_data = api.payload

        user = facade.get_user(user_id)

        user_id = get_jwt_identity()['id']

        if user_id != user.id:
            return {'Unauthorized action.'}, 403
        
        if "user_id" in user_data:
            return {'You cannot modify id'}, 403
        
        if user.email != user_data["email"]:
           return {"error": "You cannot modify email or password."}, 400
        else:
            user_data.pop("email")

        if not bcrypt.check_password_hash(user.password, user_data["password"]):  
            return {"error": "You cannot modify email or password."}, 400
        else:
            user_data.pop("password")

        if not user:
            return {'error': 'User not found'}, 404
        try:
            facade.update_user(user_id, user_data)
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

@api.route('/users/')
class AdminUserCreate(Resource):
    @jwt_required()
    def post(self):
        """Register a user by admin"""
        current_user = get_jwt_identity()

        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        user_data = request.json
        email = user_data.get('email')

        # Check if email is already in use
        if facade.get_user_by_email(email):
            return {'error': 'Email already registered'}, 400
        
        password = user_data.get('password')
        
        try:
            new_user = facade.create_user(user_data)
            new_user.hash_password(password)
            return {"message" : "User created by admin"}, 201
        except Exception as e:
            return {'error': str(e)}, 400
