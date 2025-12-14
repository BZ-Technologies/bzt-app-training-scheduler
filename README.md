# Training Scheduling Application

**Repository**: `BZ-Technologies/bzt-app-training-scheduler`  
**Application Code**: `training-scheduler`  
**Route**: `/training`  
**Version**: 1.0.0

## Overview

The Training Scheduling application is a comprehensive class and training session management system designed for training organizations, educational institutions, and certification programs. It provides complete functionality for managing classes, scheduling sessions, handling student registrations, and tracking instructors.

This is a standalone application module that can be deployed to tenant infrastructure as part of the BZ Technologies platform.

## Features

- **Class Management**: Create and manage training classes with categories, levels, pricing, and curriculum details
- **Session Scheduling**: Schedule multiple sessions per class with dates, times, locations, and instructor assignments
- **Student Registration**: Online registration system with payment processing integration support
- **Instructor Management**: Manage instructor profiles, assignments, and availability
- **Seat Management**: Track available seats and manage capacity for each session
- **Category Organization**: Organize classes by categories (e.g., pistol, rifle, first-aid, etc.)
- **Tenant Isolation**: All data is tenant-scoped and isolated

## Architecture

### Database Schema

- `training_categories`: Stores class categories (tenant-scoped)
- `training_classes`: Stores class definitions with pricing and details (tenant-scoped)
- `training_class_sessions`: Stores scheduled sessions with dates, times, and capacity (tenant-scoped)
- `training_registrations`: Stores student registrations with payment status (tenant-scoped)
- `training_instructors`: Stores instructor profiles and information (tenant-scoped)
- `training_contact_messages`: Stores contact form submissions (tenant-scoped)

### Components

1. **Backend Service** (`src/services/TrainingSchedulerService.js`)
   - Manages CRUD operations for categories, classes, sessions, and registrations
   - Tenant-scoped queries
   - Business logic for seat management and session status

2. **API Routes** (`src/routes/TrainingSchedulerRoutes.js`)
   - `GET /api/training/categories` - List all categories
   - `GET /api/training/classes` - List all classes (with optional category filter)
   - `GET /api/training/classes/:id` - Get specific class
   - `GET /api/training/classes/:classId/sessions` - Get sessions for a class
   - `POST /api/training/sessions` - Create or update a session
   - `GET /api/training/registrations` - List registrations (with optional filters)
   - `POST /api/training/registrations` - Create a new registration
   - `PUT /api/training/registrations/:id/status` - Update registration status

3. **Frontend** (`client/src/app/training/page.tsx`)
   - React component for browsing classes and sessions
   - Category filtering
   - Class details and session viewing
   - Registration interface (ready for payment integration)

## Repository Structure

```
bzt-app-training-scheduler/
├── README.md                    # This file
├── package.json                 # Node.js dependencies
├── src/
│   ├── routes/                 # Express routes
│   │   └── TrainingSchedulerRoutes.js
│   └── services/               # Business logic
│       └── TrainingSchedulerService.js
├── migrations/                  # Database migrations
│   ├── db-init-training-scheduler.sql
│   └── db-add-training-scheduler-app.sql
└── client/                      # Frontend components
    └── src/app/training/
        └── page.tsx
```

## Setup

### 1. Database Setup

Run the database initialization scripts:

```bash
# Create tables
mysql -u root -p bzt_main_db < migrations/db-init-training-scheduler.sql

# Add to applications catalog (after applications table exists)
mysql -u root -p bzt_main_db < migrations/db-add-training-scheduler-app.sql
```

### 2. Environment Variables

No application-specific environment variables are required. The application uses the platform's database connection pool and tenant middleware.

### 3. Integration with Portal

Add the routes to the portal's `server.js`:

```javascript
const trainingRoutes = require('./bzt-app-training-scheduler/src/routes/TrainingSchedulerRoutes');
app.use('/api/training', tenantMiddleware, trainingRoutes);
```

## Usage

### Managing Classes

1. Navigate to `/training` in the portal
2. Browse classes by category
3. Click on a class to view details and available sessions
4. View session information including dates, times, locations, and seat availability

### Creating Classes and Sessions

Classes and sessions are typically created through the admin interface or API. The frontend currently focuses on browsing and registration.

### Student Registration

1. Browse available classes
2. Select a class to view sessions
3. Click "Register Now" on an available session
4. Complete registration form (payment integration can be added)

## API Endpoints

All endpoints require authentication and tenant context.

### Categories

- `GET /api/training/categories` - Get all categories
- `GET /api/training/categories/:id` - Get specific category
- `POST /api/training/categories` - Create category
- `PUT /api/training/categories/:id` - Update category

### Classes

- `GET /api/training/classes` - Get all classes (optional `?category=id` filter)
- `GET /api/training/classes/:id` - Get specific class
- `POST /api/training/classes` - Create class
- `PUT /api/training/classes/:id` - Update class

### Sessions

- `GET /api/training/classes/:classId/sessions` - Get sessions for a class
- `GET /api/training/sessions/:id` - Get specific session
- `POST /api/training/sessions` - Create or update session
- `PUT /api/training/sessions/:id` - Update session
- `DELETE /api/training/sessions/:id` - Delete session

### Registrations

- `GET /api/training/registrations` - Get registrations (optional filters: `?class_id=`, `?session_id=`, `?status=`, `?email=`)
- `POST /api/training/registrations` - Create registration
- `PUT /api/training/registrations/:id/status` - Update registration status

## Payment Integration

The application is designed to support payment processing integration. The reference implementation uses NMI/TacticalPay, but the platform version can integrate with any payment gateway or use the platform's payment service.

## Future Enhancements

- [ ] Payment processing integration
- [ ] Email notifications for registrations
- [ ] Instructor management interface
- [ ] Admin panel for managing classes and sessions
- [ ] Waitlist management for full sessions
- [ ] Recurring session templates
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Automated reminders
- [ ] Advanced reporting and analytics

## Troubleshooting

### Common Issues

1. **Classes Not Appearing**
   - Verify tenant has subscribed to training-scheduler application
   - Check database: `SELECT * FROM training_classes WHERE tenant_id = ?`
   - Verify API routes are registered in portal's `server.js`

2. **Sessions Not Loading**
   - Verify class exists: `SELECT * FROM training_classes WHERE id = ? AND tenant_id = ?`
   - Check session data: `SELECT * FROM training_class_sessions WHERE class_id = ? AND tenant_id = ?`

3. **Registration Issues**
   - Verify session has available seats
   - Check registration status in database
   - Ensure transaction_id is unique per tenant

---

**Last Updated**: December 2024  
**Application Code**: `training-scheduler`  
**Route**: `/training`  
**Reference Implementation**: See `bzt-architecture/TRAINING-SCHEDULER-REFERENCE.md`
