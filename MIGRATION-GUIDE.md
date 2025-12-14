# Database Migration Guide

## Overview

The Training Scheduling application includes automated migration tools to safely deploy database schema changes to the database server.

## Migration Files

Migrations are located in the `migrations/` directory and are executed in order:

1. `db-init-training-scheduler.sql` - Creates all application tables
2. `db-add-training-scheduler-app.sql` - Adds application to catalog

## Migration Runner

### Features

- **Idempotent**: Can be run multiple times safely
- **Tracking**: Records executed migrations in `migration_history` table
- **Dry Run**: Preview what would be executed without making changes
- **Error Handling**: Stops on first error and provides clear messages

### Usage

```bash
# Run all pending migrations
npm run migrate

# Preview migrations (dry run)
npm run migrate:dry-run

# Force re-run all migrations
npm run migrate:force
```

### Environment Variables

The migration runner uses the same database configuration as the application:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bzt_main_db
```

### Migration Tracking

Migrations are tracked in the `migration_history` table:

```sql
CREATE TABLE migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  app_code VARCHAR(50) NOT NULL,
  migration_file VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_migration (app_code, migration_file)
);
```

This prevents:
- Running the same migration twice
- Missing migrations
- Out-of-order execution

## Deployment Script

The `scripts/deploy.sh` script provides a complete deployment workflow:

```bash
sudo ./scripts/deploy.sh
```

This script:
1. Installs npm dependencies
2. Runs database migrations
3. Checks for portal integration
4. Provides next steps

## Manual Migration

If you prefer to run migrations manually:

```bash
# Connect to database
mysql -u root -p bzt_main_db

# Or execute SQL files directly
mysql -u root -p bzt_main_db < migrations/db-init-training-scheduler.sql
mysql -u root -p bzt_main_db < migrations/db-add-training-scheduler-app.sql
```

## CI/CD Integration

The migration runner can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Migrations
  run: |
    cd bzt-app-training-scheduler
    npm install
    npm run migrate
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USER: ${{ secrets.DB_USER }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
    DB_NAME: ${{ secrets.DB_NAME }}
```

## Troubleshooting

### Migration Already Executed

If a migration shows as already executed but you need to re-run it:

```bash
npm run migrate:force
```

### Connection Errors

Verify your `.env` file has correct database credentials:

```bash
# Test connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1"
```

### Migration Fails

1. Check the error message for specific SQL errors
2. Verify database user has CREATE/ALTER permissions
3. Check if tables already exist (may need to drop first)
4. Review migration SQL for syntax errors

## Best Practices

1. **Always test migrations** in a development environment first
2. **Use dry-run** before production deployments
3. **Backup database** before running migrations in production
4. **Run migrations** during maintenance windows for large changes
5. **Monitor migration_history** table to track deployment status

## Future Enhancements

- Migration rollback support
- Version-based migration ordering
- Migration validation checks
- Automated backup before migration

