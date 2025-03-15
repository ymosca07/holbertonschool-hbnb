-- Drop existing tables
DROP TABLE IF EXISTS Place_Amenity;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Amenity;
DROP TABLE IF EXISTS Place;
DROP TABLE IF EXISTS User;

-- Create User Table
CREATE TABLE User (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create Place Table
CREATE TABLE Place (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    owner_id CHAR(36),
    FOREIGN KEY (owner_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Create Review Table
CREATE TABLE Review (
    id CHAR(36) PRIMARY KEY,
    text TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    user_id CHAR(36),
    place_id CHAR(36),
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES Place(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id)
);

-- Create Amenity Table
CREATE TABLE Amenity (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Create Place_Amenity Table
CREATE TABLE Place_Amenity (
    place_id CHAR(36),
    amenity_id CHAR(36),
    PRIMARY KEY (place_id, amenity_id),
    FOREIGN KEY (place_id) REFERENCES Place(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES Amenity(id) ON DELETE CASCADE
);

-- Insert Administrator User
INSERT INTO User (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2a$12$1plb8rbaWHUWAFbNVUOf4.Hr2/GhCzGjogBuqXS7ZMaVE/VLb3NbS',
    TRUE
);

-- Insert Initial Amenities
INSERT INTO Amenity (id, name) VALUES
    (UUID(), 'WiFi'),
    (UUID(), 'Swimming Pool'),
    (UUID(), 'Air Conditioning');
