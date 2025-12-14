#!/bin/bash
# Script to replace template placeholders with actual values
# Usage: ./scripts/replace-placeholders.sh

set -e

echo "🔧 Application Template Placeholder Replacement"
echo "=============================================="
echo ""

# Get input from user
read -p "Application code (e.g., calendar): " APP_CODE
read -p "Application name (e.g., Calendar Management): " APP_NAME
read -p "Route path (e.g., calendar): " ROUTE_PATH
read -p "Category (productivity/ecommerce/hosting): " CATEGORY
read -p "Description: " DESCRIPTION

# Convert app code to CamelCase
APP_CODE_CAMEL=$(echo "$APP_CODE" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')

echo ""
echo "Replacing placeholders..."
echo "  {app-code} → $APP_CODE"
echo "  {appCode} → $APP_CODE_CAMEL"
echo "  {App Name} → $APP_NAME"
echo "  {APP_ROUTE} → $ROUTE_PATH"
echo "  {route} → $ROUTE_PATH"
echo "  {route-path} → $ROUTE_PATH"
echo "  {category} → $CATEGORY"
echo ""

# Find and replace in all files
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s/{app-code}/$APP_CODE/g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s/{appCode}/$APP_CODE_CAMEL/g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s/{App Name}/$APP_NAME/g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s/{APP_ROUTE}/$ROUTE_PATH/g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s|{route}|$ROUTE_PATH|g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s|{route-path}|$ROUTE_PATH|g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s/{category}/$CATEGORY/g" {} +
find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -name 'replace-placeholders.sh' ! -name 'TEMPLATE-README.md' -exec sed -i "s|{Application description}|$DESCRIPTION|g" {} +

# Rename files and directories
if [ -d "client/src/app/{APP_ROUTE}" ]; then
    mv "client/src/app/{APP_ROUTE}" "client/src/app/$ROUTE_PATH"
fi

find . -type f -name "*{app-code}*" | while read file; do
    newfile=$(echo "$file" | sed "s/{app-code}/$APP_CODE/g")
    if [ "$file" != "$newfile" ]; then
        mv "$file" "$newfile"
    fi
done

find . -type f -name "*{appCode}*" | while read file; do
    newfile=$(echo "$file" | sed "s/{appCode}/$APP_CODE_CAMEL/g")
    if [ "$file" != "$newfile" ]; then
        mv "$file" "$newfile"
    fi
done

echo "✅ Placeholders replaced!"
echo ""
echo "Next steps:"
echo "1. Review the files and customize as needed"
echo "2. Update README.md with specific details"
echo "3. Customize database schema in migrations/"
echo "4. Customize frontend in client/src/app/$ROUTE_PATH/"
echo "5. git add . && git commit -m 'Initial commit: $APP_NAME'"
echo "6. Create GitHub repository and push"

