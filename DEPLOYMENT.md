# Training Scheduling Application Deployment

## Overview

This document describes how to deploy the Training Scheduling application to tenant infrastructure as part of the BZ Technologies platform.

## Prerequisites

- Node.js 18+ installed
- MariaDB/MySQL database access
- Access to tenant infrastructure
- Required API keys (if applicable)

## Installation Steps

### 1. Clone Repository

```bash
cd /opt
git clone git@github.com:BZ-Technologies/bzt-app-training-scheduler.git
cd bzt-app-training-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file:

```env
# Database Configuration
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=bzt_main_db

# Application-specific configuration
{APP_CONFIG_KEY}=your_value_here

# Node Environment
NODE_ENV=production
```

### 4. Run Database Migrations

#### Option A: Automated Migration Runner (Recommended)

```bash
# Run all migrations
npm run migrate

# Dry run (see what would be executed)
npm run migrate:dry-run

# Force re-run migrations (if needed)
npm run migrate:force
```

The migration runner:
- Tracks which migrations have been executed
- Prevents duplicate execution
- Provides clear error messages
- Can be run multiple times safely

#### Option B: Manual MySQL Execution

```bash
# Create application tables
mysql -u root -p bzt_main_db < migrations/db-init-training-scheduler.sql

# Add to applications catalog
mysql -u root -p bzt_main_db < migrations/db-add-training-scheduler-app.sql
```

#### Option C: Full Automated Deployment

```bash
# Run the complete deployment script
sudo ./scripts/deploy.sh
```

This script handles:
- Dependency installation
- Database migrations
- Integration checks

### 5. Integrate with Portal

#### Backend Integration

Add routes to portal's `server.js`:

```javascript
const TrainingSchedulerRoutes = require('/opt/bzt-app-training-scheduler/src/routes/TrainingSchedulerRoutes');
app.use('/api/training', tenantMiddleware, TrainingSchedulerRoutes);
```

#### Frontend Integration

Copy frontend component to portal:

```bash
cp -r /opt/bzt-app-training-scheduler/client/src/app/training /opt/bzt-portal/client/src/app/
```

### 6. Setup Worker (if applicable)

#### Option A: Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (adjust schedule as needed)
*/5 * * * * cd /opt/bzt-app-training-scheduler && /usr/bin/node src/workers/TrainingSchedulerWorker.js >> /var/log/training-scheduler-worker.log 2>&1
```

#### Option B: PM2

```bash
pm2 start src/workers/TrainingSchedulerWorker.js --name training-scheduler-worker --cron "*/5 * * * *"
pm2 save
```

## Version Management

This application uses semantic versioning. To update:

```bash
cd /opt/bzt-app-training-scheduler
git pull origin main
npm install
# Restart worker if needed
```

## Troubleshooting

See main README.md for troubleshooting steps.

