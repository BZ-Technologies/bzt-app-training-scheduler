# Setting Up GitHub Repository for bzt-app-training-scheduler

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/organizations/BZ-Technologies/repositories/new
   (Or https://github.com/new if creating under your personal account)

2. Repository settings:
   - **Repository name**: `bzt-app-training-scheduler`
   - **Description**: "Comprehensive class and training session scheduling system with student registration, payment processing, and instructor management"
   - **Visibility**: Private (recommended) or Public
   - **Initialize repository**: ❌ DO NOT check any boxes (we already have files)

3. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, run:

```bash
cd ~/bztech/code/bzt-app-training-scheduler
git remote add origin git@github.com:BZ-Technologies/bzt-app-training-scheduler.git
git push -u origin main
```

Or use the helper script:

```bash
./push-to-github.sh
```

## Step 3: Verify

Check the repository at:
https://github.com/BZ-Technologies/bzt-app-training-scheduler

