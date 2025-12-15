# Test Documentation

## Overview
This directory contains test files for the Smart Queue Platform, covering:
- **US-12**: Role Restriction Testing
- **US-13**: Error Handling Testing
- **US-14**: Usability Validation (Frontend tests)

## Test Files

### Backend Tests

1. **role-restriction.test.js**
   - Tests role-based access control
   - Verifies customers cannot create services
   - Verifies providers cannot create bookings
   - Tests unauthorized access prevention
   - Tests valid role-based access

2. **error-handling.test.js**
   - Tests invalid login credentials
   - Tests registration validation errors
   - Tests service creation validation
   - Tests booking creation validation
   - Tests booking status update validation
   - Verifies error response format consistency

### Frontend Tests

1. **usability.test.js**
   - Tests registration flow usability
   - Tests login flow usability
   - Tests customer dashboard usability
   - Tests provider dashboard usability
   - Verifies error message clarity

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Test Coverage

Tests cover:
- ✅ Role restrictions (US-12)
- ✅ Error handling scenarios (US-13)
- ✅ Usability validation (US-14)
- ✅ API endpoint security
- ✅ Input validation
- ✅ User experience flows

## Notes

- Backend tests use Supertest for HTTP testing
- Frontend tests use React Testing Library
- Tests use a test database (test.db) separate from dev database
- All test data is cleaned up after tests complete

