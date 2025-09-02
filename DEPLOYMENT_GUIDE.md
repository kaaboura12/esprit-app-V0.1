# Deployment Guide - Fixing Login Issues

## The Problem
Your app is showing only the login page and login attempts just refresh because the required environment variables are missing in production.

## Required Environment Variables

Your app needs these environment variables to work properly:

### 1. Supabase Configuration
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

### 2. JWT Secret
```bash
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Gmail Configuration (for password reset emails)
```bash
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

### 4. Node Environment
```bash
NODE_ENV=production
```

## How to Fix

### Step 1: Create .env.production file
Create a file named `.env.production` in your project root with the above variables.

### Step 2: Get Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### Step 3: Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### Step 4: Set up Gmail (Optional)
If you want password reset emails to work:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use that as GMAIL_APP_PASSWORD

### Step 5: Deploy
Your Dockerfile is already configured to copy `.env.production` as `.env` during build.

## Current Issue
The app is failing because:
1. Database connection fails (missing SUPABASE_URL/SUPABASE_KEY)
2. JWT token generation fails (missing JWT_SECRET)
3. This causes the login API to return errors
4. Frontend shows login page but can't authenticate

## Quick Test
To test locally, create a `.env.local` file with the same variables and run:
```bash
npm run dev
```

## Database Schema
Make sure your Supabase database has these tables:
- `teacher` (with columns: id, firstname, lastname, email, departement, motdepasse, role, is_active)
- `etudiant` (students table)
- `classe` (classes table)
- `matiere` (subjects table)
- `note_finale` (grades table)
- And other tables as needed

## Security Note
Never commit `.env.production` to git. It should be in your `.gitignore` file.
