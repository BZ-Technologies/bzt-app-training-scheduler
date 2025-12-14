#!/bin/bash
# Deployment script for Training Scheduling application
# This script handles the complete deployment process including migrations

set -e

APP_NAME="Training Scheduling"
APP_CODE="training-scheduler"
REPO_PATH="/opt/bzt-app-training-scheduler"
PORTAL_PATH="/opt/bzt-portal"

echo "🚀 Deploying $APP_NAME Application"
echo "===================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script should be run with sudo for database access"
    echo "   Usage: sudo ./scripts/deploy.sh"
    exit 1
fi

# Check if repository exists
if [ ! -d "$REPO_PATH" ]; then
    echo "❌ Repository not found at $REPO_PATH"
    echo "   Please clone the repository first:"
    echo "   git clone git@github.com:BZ-Technologies/bzt-app-$APP_CODE.git $REPO_PATH"
    exit 1
fi

cd "$REPO_PATH"

# Check if .env file exists
if [ ! -f "$REPO_PATH/.env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f "$REPO_PATH/.env.example" ]; then
        cp "$REPO_PATH/.env.example" "$REPO_PATH/.env"
        echo "✅ Created .env file. Please edit it with your configuration."
        echo "   Then run this script again."
        exit 1
    else
        echo "❌ No .env.example found. Please create .env file manually."
        exit 1
    fi
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Running database migrations..."

# Check if Node.js migration runner exists
if [ -f "$REPO_PATH/scripts/run-migrations.js" ]; then
    echo "   Using Node.js migration runner..."
    node scripts/run-migrations.js
else
    echo "   Using direct MySQL execution..."
    # Fallback to direct MySQL execution
    if command -v mysql &> /dev/null; then
        DB_NAME=$(grep DB_NAME "$REPO_PATH/.env" | cut -d '=' -f2 | tr -d ' ')
        if [ -z "$DB_NAME" ]; then
            DB_NAME="bzt_main_db"
        fi
        
        echo "   Running: db-init-training-scheduler.sql"
        mysql -u root -p "$DB_NAME" < "$REPO_PATH/migrations/db-init-training-scheduler.sql"
        
        echo "   Running: db-add-training-scheduler-app.sql"
        mysql -u root -p "$DB_NAME" < "$REPO_PATH/migrations/db-add-training-scheduler-app.sql"
    else
        echo "❌ MySQL client not found. Please run migrations manually."
        exit 1
    fi
fi

echo ""
echo "🔗 Step 3: Integration with portal..."

# Check if portal exists
if [ ! -d "$PORTAL_PATH" ]; then
    echo "⚠️  Portal not found at $PORTAL_PATH"
    echo "   Skipping automatic integration."
    echo "   Please manually integrate routes and frontend."
else
    echo "   Portal found. Integration steps:"
    echo "   1. Add routes to portal's server.js"
    echo "   2. Copy frontend component to portal"
    echo ""
    echo "   See INTEGRATION-NOTES.md for details"
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Verify database tables were created"
echo "2. Integrate routes into portal (see INTEGRATION-NOTES.md)"
echo "3. Copy frontend component to portal"
echo "4. Restart portal services"
echo ""

