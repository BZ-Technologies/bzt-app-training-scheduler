# Integration Notes

## Platform Dependencies

This application requires the following from the BZ Technologies platform:

### Backend Dependencies

1. **Database Pool** (`src/db/pool.js`)
   - The routes and services expect a database connection pool
   - Must be compatible with MariaDB/MySQL
   - Should export `getConnection()` function

2. **Tenant Middleware** (`src/middleware/tenantMiddleware.js`)
   - Required for tenant isolation
   - Must provide `tenantMiddleware` function
   - Must provide `getTenantId()` function

### Integration Points

When integrating this app into the portal:

1. **Copy routes to portal:**
   ```javascript
   // In portal's server.js
   const TrainingSchedulerRoutes = require('/path/to/bzt-app-training-scheduler/src/routes/TrainingSchedulerRoutes');
   app.use('/api/training', tenantMiddleware, TrainingSchedulerRoutes);
   ```

2. **Copy services to portal:**
   ```javascript
   // Services can be used directly if paths are adjusted
   // Or copy to portal's services directory
   ```

3. **Copy frontend component:**
   ```bash
   cp -r /path/to/bzt-app-training-scheduler/client/src/app/training \
         /path/to/bzt-portal/client/src/app/
   ```

4. **Database Migrations:**
   ```bash
   # Run migrations to create tables
   mysql -u root -p bzt_main_db < migrations/db-init-training-scheduler.sql
   mysql -u root -p bzt_main_db < migrations/db-add-training-scheduler-app.sql
   ```

5. **Payment Integration (Optional):**
   - The application supports payment processing but requires integration
   - Reference implementation uses NMI/TacticalPay
   - Can integrate with platform payment service or tenant-specific gateway

## Future: Standalone Package

In the future, this could be packaged as an npm package with:
- Shared utilities as peer dependencies
- Clear integration API
- Version management

