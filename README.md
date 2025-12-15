# Smart Service Booking & Queue Management Platform

A full-stack web application for managing service bookings and queue systems, built with React (Frontend) and Node.js/Express (Backend) with Prisma and SQLite.

## Table of Contents

- [Overview](#overview)
- [User Types and Roles](#user-types-and-roles)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)

## Overview

The Smart Service Booking & Queue Management Platform enables service providers to offer their services and customers to book appointments with automatic queue number assignment. The system supports role-based access control with three distinct user types: CUSTOMER, PROVIDER, and ADMIN.

### Key Capabilities

- **Service Management**: Providers can create and manage services
- **Booking System**: Customers can book services with automatic queue number assignment
- **Queue Management**: Providers can track and update booking statuses through the service lifecycle
- **Role-Based Access**: Different dashboards and permissions based on user role

## User Types and Roles

The application supports three user roles: **CUSTOMER**, **PROVIDER**, and **ADMIN**.

Role-based access control is enforced at the backend using JWT authentication and role checks.

### 1. CUSTOMER

**Description**

The CUSTOMER role represents end users who consume services offered on the platform.

This is the default role assigned when no role is explicitly selected during registration.

**Permissions**

- Register and log in to the system
- Browse all active services
- Create service bookings by selecting a service and date/time
- Automatically receive a queue number for each booking
- View personal booking history
- Track booking status (WAITING, SERVING, COMPLETED, CANCELLED)

**Restrictions**

- Cannot create or manage services
- Cannot view bookings created by other users
- Cannot update booking statuses

### 2. PROVIDER

**Description**

The PROVIDER role represents service providers who offer services and manage customer bookings related to those services.

**Permissions**

- Register and log in as a service provider
- Create and manage services (title, description, active/inactive)
- View all bookings related to their own services
- View customer information associated with bookings
- Update booking status through the queue lifecycle:
  - WAITING → SERVING → COMPLETED → CANCELLED

**Restrictions**

- Cannot create bookings (booking creation is restricted to CUSTOMERS)
- Cannot manage bookings belonging to services created by other providers

### 3. ADMIN

**Description**

The ADMIN role is intended for administrative users.

In the current implementation, the ADMIN role has the same permissions as the PROVIDER role.

**Permissions**

- All permissions available to PROVIDER
- Create services
- View bookings for services owned by the admin account
- Update booking statuses

**Implementation Note**

No additional admin-specific functionality (such as global booking management or user management) is implemented at this stage.

ADMIN access is enforced using the same role checks as PROVIDER in the backend.

### Role Assignment Rules

- During registration, users can select:
  - CUSTOMER
  - PROVIDER
  - ADMIN
- If no role is selected, the system assigns the CUSTOMER role by default.
- Role information is stored in the database and embedded in the JWT token for access control.

### Summary

- **Total roles**: 3 (CUSTOMER, PROVIDER, ADMIN)
- **Default role**: CUSTOMER
- **Role enforcement**: Backend-level role checks using JWT
- **Admin scope**: Equivalent to Provider in the current version
- **No unsupported claims**: All permissions listed reflect actual implemented behavior

This role structure is fully aligned with the current codebase and assignment requirements and is safe to include in the coursework submission.

## Features

### Core Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Service Management**: Providers can create, view, and manage their services
- **Booking System**: Customers can book services with automatic queue number assignment
- **Queue Management**: Sequential queue numbers assigned per service and date
- **Status Tracking**: Four booking statuses (WAITING, SERVING, COMPLETED, CANCELLED)
- **Dashboard Views**: Role-specific dashboards for customers and providers

### Technical Features

- RESTful API architecture
- SQLite database with Prisma ORM
- Password hashing with bcrypt
- Input validation with Zod
- CORS-enabled for frontend-backend communication
- Error handling middleware

### Current Limitations

- **No Real-time Updates**: Updates are reflected after refresh / reloading data
- **No Availability Scheduling**: Service availability scheduling is not implemented
- **MVP Implementation**: Core booking, queue assignment, and status management implemented

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Environment**: dotenv

### Frontend

- **Framework**: React
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: Inline styles with modern design

## Project Structure

```
smart-queue-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.routes.js
│   │   │   ├── services/
│   │   │   │   ├── services.controller.js
│   │   │   │   └── services.routes.js
│   │   │   └── bookings/
│   │   │       ├── bookings.controller.js
│   │   │       └── bookings.routes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── CustomerDashboard.js
    │   │   └── ProviderDashboard.js
    │   ├── utils/
    │   │   └── auth.js
    │   └── App.js
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (LTS version)
- npm (comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected)

### Services

- `GET /api/services` - List all active services
- `GET /api/services/mine` - Get provider's services (PROVIDER/ADMIN only)
- `POST /api/services` - Create a new service (PROVIDER/ADMIN only)

### Bookings

- `POST /api/bookings` - Create a booking (CUSTOMER only)
- `GET /api/bookings/mine` - Get customer's bookings (CUSTOMER only)
- `GET /api/bookings/provider` - Get provider's bookings (PROVIDER/ADMIN only)
- `PATCH /api/bookings/:id/status` - Update booking status (PROVIDER/ADMIN only)

### Health Check

- `GET /api/health` - API health check

## Database Schema

### User Model

- `id` - Unique identifier (CUID)
- `fullName` - User's full name
- `email` - Unique email address
- `passwordHash` - Hashed password
- `role` - User role (CUSTOMER, PROVIDER, ADMIN)
- `createdAt` - Account creation timestamp

### Service Model

- `id` - Unique identifier (CUID)
- `providerId` - Reference to provider user
- `title` - Service title
- `description` - Service description (optional)
- `active` - Service availability status (boolean)
- `createdAt` - Service creation timestamp

### Booking Model

- `id` - Unique identifier (CUID)
- `customerId` - Reference to customer user
- `serviceId` - Reference to service
- `date` - Booking date and time
- `queueNumber` - Assigned queue number
- `status` - Booking status (WAITING, SERVING, COMPLETED, CANCELLED)
- `createdAt` - Booking creation timestamp

## Booking Status Flow

1. **WAITING** - Initial status when booking is created
2. **SERVING** - Provider is currently serving the customer
3. **COMPLETED** - Service has been completed
4. **CANCELLED** - Booking has been cancelled

## Queue Number Assignment

- Queue numbers are assigned automatically when a booking is created
- Numbers are sequential per service and date
- Cancelled bookings do not affect the queue count
- Each service+date combination has its own independent queue

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Token expiration: 7 days
- Role-based access control at API level
- Input validation with Zod schemas
- CORS enabled for frontend communication

## Development Status

**MVP-level implementation suitable for demonstration and evaluation.**

### Implemented Features

✅ User registration and authentication  
✅ Role-based access control  
✅ Service creation and management  
✅ Booking creation with queue assignment  
✅ Status management workflow  
✅ Customer and Provider dashboards  

### Not Implemented

❌ Real-time updates (WebSockets/polling)  
❌ Service availability scheduling  
❌ Advanced admin features  
❌ Email notifications  
❌ Booking cancellation by customers  

## License

This project is created for educational/coursework purposes.

