# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
d
   Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
   - `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard


3. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Getting Spotify API Credentials

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create an app"
4. Fill in app details (name, description)
5. Accept the terms
6. Copy the Client ID and Client Secret
7. Add them to your `.env` file

## Setting Up Daily Album Fetching

### Option 1: Manual Script
Run manually when needed:
```bash
npm run fetch-albums
```

### Option 2: Cron Job (Production)
Set up a cron job to call:
```
GET https://your-domain.com/api/cron/fetch-albums
Authorization: Bearer YOUR_CRON_SECRET
```

Add `CRON_SECRET` to your `.env` file for security.

### Option 3: Vercel Cron (if deploying to Vercel)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/fetch-albums",
    "schedule": "0 0 * * *"
  }]
}
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`

### Spotify API Errors
- Verify your credentials are correct
- Check if your app is approved (may take time for new apps)

### Authentication Issues
- Generate a new NEXTAUTH_SECRET
- Clear browser cookies
- Check that callback URLs match your environment

