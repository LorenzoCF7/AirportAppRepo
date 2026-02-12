-- ===================================
-- AIRPORT APP - SCRIPT SQL
-- Base de datos: airport_db
-- ===================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS airport_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE airport_db;

-- ===================================
-- TABLA: users
-- Usuarios del sistema
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLA: tickets
-- Billetes de vuelo comprados
-- ===================================
-- NOTA: Esta tabla se crea automáticamente por JPA/Hibernate
-- con spring.jpa.hibernate.ddl-auto=update
-- Este script es solo de referencia y para creación manual si se necesita

CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Propietario
    owner_user_id VARCHAR(255) NOT NULL,
    
    -- Información del vuelo
    flight_number VARCHAR(255) NOT NULL,
    flight_iata VARCHAR(10) NOT NULL,
    airline_name VARCHAR(255) NOT NULL,
    airline_iata VARCHAR(5) NOT NULL,
    
    -- Información de salida
    departure_airport VARCHAR(255) NOT NULL,
    departure_iata VARCHAR(5) NOT NULL,
    departure_city VARCHAR(255) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    
    -- Información de llegada
    arrival_airport VARCHAR(255) NOT NULL,
    arrival_iata VARCHAR(5) NOT NULL,
    arrival_city VARCHAR(255) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    
    -- Información del pasajero
    passenger_name VARCHAR(255) NOT NULL,
    passenger_document VARCHAR(255) NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    
    -- Detalles del billete
    ticket_class ENUM('ECONOMY', 'BUSINESS', 'FIRST') NOT NULL DEFAULT 'ECONOMY',
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    booking_reference VARCHAR(6) NOT NULL UNIQUE,
    ticket_status ENUM('CONFIRMED', 'CANCELLED', 'PENDING') NOT NULL DEFAULT 'CONFIRMED',
    
    -- Timestamps
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_owner_user_id (owner_user_id),
    INDEX idx_flight_iata (flight_iata),
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_ticket_status (ticket_status),
    INDEX idx_departure_date (departure_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLA: users (para futuro)
-- Se implementará cuando se añada autenticación
-- ===================================
-- CREATE TABLE IF NOT EXISTS users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     document_number VARCHAR(50),
--     phone VARCHAR(20),
--     enabled BOOLEAN NOT NULL DEFAULT TRUE,
--     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     
--     INDEX idx_username (username),
--     INDEX idx_email (email)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
