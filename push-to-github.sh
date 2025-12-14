#!/bin/bash
# Script to push application to GitHub
# Run this after creating the repository on GitHub

set -e

REPO_NAME="bzt-app-template"
ORG="BZ-Technologies"
REMOTE_URL="git@github.com:${ORG}/${REPO_NAME}.git"

echo "🚀 Setting up GitHub repository for $REPO_NAME"
echo "=============================================="
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote -v
    echo ""
    read -p "Do you want to update it? (yes/no): " update
    if [ "$update" = "yes" ]; then
        git remote set-url origin "$REMOTE_URL"
        echo "✅ Updated remote URL"
    else
        echo "Keeping existing remote"
    fi
else
    echo "📡 Adding remote repository..."
    git remote add origin "$REMOTE_URL"
    echo "✅ Remote added: $REMOTE_URL"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Success! Repository is now on GitHub:"
echo "   https://github.com/${ORG}/${REPO_NAME}"
echo ""
echo "You can now clone it elsewhere with:"
echo "   git clone git@github.com:${ORG}/${REPO_NAME}.git"

