# FRO.US - Poll Voting Application

A simple Next.js web application for creating and voting on polls with real-time results broken down by state.

## Features

- 🔐 User authentication (email/password)
- 📍 State-based user profiles
- 📊 Create and manage polls (admin only)
- 🗳️ Vote on active polls (one vote per poll)
- 📈 Real-time results (national + by state)
- 📱 Mobile-friendly responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel
- **Database**: PostgreSQL (via Supabase)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd frous-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor
5. This will create all necessary tables and security policies

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to **Settings** → **API** in your Supabase dashboard
   - Copy the **Project URL** and **anon/public key**

3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Database Schema

### Users Table
- `id` (UUID, primary key, references auth.users)
- `email` (text, unique)
- `state` (text)
- `created_at` (timestamp)

### Polls Table
- `id` (UUID, primary key)
- `question` (text)
- `options` (jsonb - array of options)
- `creator_id` (UUID, references users)
- `active` (boolean)
- `created_at` (timestamp)

### Votes Table
- `id` (UUID, primary key)
- `poll_id` (UUID, references polls)
- `user_id` (UUID, references users)
- `option_index` (integer)
- `state` (text)
- `created_at` (timestamp)
- Unique constraint: one vote per user per poll

## File Structure

```
frous-app/
├── pages/
│   ├── _app.js          # App wrapper with navigation
│   ├── index.js         # Homepage
│   ├── auth.js          # Sign up / Sign in
│   ├── polls.js         # View and vote on polls
│   ├── results.js       # View poll results
│   └── admin.js         # Create and manage polls
├── lib/
│   ├── supabase.js      # Supabase client
│   └── states.js        # US states list
├── styles/
│   └── globals.css      # Global styles with Tailwind
├── supabase-schema.sql  # Database schema
├── .env.local.example   # Environment variables template
└── package.json         # Dependencies
```

## Usage

### For Users

1. **Sign Up**: Create an account with email/password and select your state
2. **View Polls**: Browse active polls on the Polls page
3. **Vote**: Click on an option to submit your vote (one vote per poll)
4. **View Results**: See national and state-by-state results in real-time

### For Admins

1. **Create Polls**: Go to the Admin page to create new polls
2. **Manage Polls**: Toggle polls between active/inactive
3. **Add Options**: Create polls with 2+ options
4. **No Limits**: Create as many polls as needed per day

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only vote once per poll
- Users can only manage their own data
- Poll creators can only modify their own polls
- Secure authentication via Supabase Auth

## Real-time Updates

Results page automatically updates when new votes are submitted using Supabase real-time subscriptions.

## Mobile Support

The application is fully responsive and works on all device sizes.

## Contributing

Feel free to submit issues or pull requests!

## License

MIT
