# Music Rank 🎵

A full-stack music album rating platform where users can rate their favorite albums using 4 categories: **Skip**, **Timepass**, **Good**, and **Perfection**.

## Features

- ✅ User authentication (Email/Password)
- ✅ User profiles with bio and avatar
- ✅ Follow system (follow/unfollow users)
- ✅ Album pages with Spotify integration
- ✅ Rating system (4 distinct categories)
- ✅ Album search and discovery
- ✅ Feed page showing ratings from followed users
- ✅ Trending albums based on recent ratings
- ✅ Daily cron job to fetch new albums from Spotify
- ✅ Modern, responsive UI with TailwindCSS

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (Email/Password with Credentials)
- **External APIs:** Spotify Web API
- **UI Components:** shadcn/ui + Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or use Docker Compose)
- Spotify API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "music rank"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/musicrank?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Spotify API
   SPOTIFY_CLIENT_ID="your-spotify-client-id"
   SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
   ```

4. **Set up the database**

   Using Docker Compose:
   ```bash
   docker-compose up -d
   ```

   Or use your own PostgreSQL instance and update `DATABASE_URL` in `.env`.

5. **Run database migrations**
   ```bash
   npm run db:push
   # or
   npm run db:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

7. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

8. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run fetch-albums` - Fetch new albums from Spotify

## Setting Up Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the Client ID and Client Secret
4. Add them to your `.env` file

## Setting Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

## Daily Cron Job

To automatically fetch new albums from Spotify daily, you can:

1. **Use a cron service** (recommended for production):
   - Set up a cron job on your server
   - Or use a service like [cron-job.org](https://cron-job.org) to call your API endpoint

2. **Run manually**:
   ```bash
   npm run fetch-albums
   ```

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── album/[id]/       # Album detail page
│   ├── auth/             # Authentication pages
│   ├── feed/             # User feed page
│   ├── profile/[username]/ # User profile page
│   └── search/           # Search page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── AlbumCard.tsx
│   ├── FollowButton.tsx
│   ├── Navbar.tsx
│   └── RatingButtons.tsx
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   ├── spotify.ts       # Spotify API integration
│   └── utils.ts         # Utility functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed file
├── scripts/
│   └── fetch-new-albums.ts # Cron job script
└── types/
    └── next-auth.d.ts   # TypeScript definitions
```

## Database Schema

- **User** - User accounts with authentication
- **Album** - Music albums from Spotify
- **Rating** - User ratings for albums (SKIP, TIMEPASS, GOOD, PERFECTION)
- **Follow** - User follow relationships

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

