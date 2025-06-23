# Hybrid Database Setup Guide - Supabase + Local PostgreSQL

Your BaldSphere application now supports both Supabase and local PostgreSQL databases. You can use them individually or together.

## Current Configuration

Your `.env.local` file now supports:
- **Local PostgreSQL** for development and testing
- **Supabase** for cloud features and production
- **Hybrid mode** that intelligently chooses the best database

## Database Modes

Set `DB_MODE` in your `.env.local` to control which database to use:

- `DB_MODE=local` - Use only local PostgreSQL
- `DB_MODE=supabase` - Use only Supabase  
- `DB_MODE=hybrid` - Use local PostgreSQL when available, fallback to Supabase

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or use existing: `feyuzboonbqmavpbjvdi`
3. Go to **Settings** → **API**
4. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://feyuzboonbqmavpbjvdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Update Your .env.local

Replace the placeholder values in your `.env.local`:

```env
# Supabase Configuration (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://feyuzboonbqmavpbjvdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create Tables in Supabase

Option A: **Use Prisma to sync to Supabase**
```bash
# Change DATABASE_URL to Supabase in .env.local
DATABASE_URL="postgresql://postgres:baldsphere1234@db.feyuzboonbqmavpbjvdi.supabase.co:5432/postgres"

# Push schema to Supabase
npx prisma db push

# Change back to local for development
DATABASE_URL="postgresql://postgres:1234@localhost:5432/baldsphere_db"
```

Option B: **Run SQL directly in Supabase**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the content from `database-setup.sql`
3. Execute the script

### 4. Test Your Setup

Create a test endpoint to verify both databases work:

```bash
# Test local database
curl http://localhost:3003/api/debug-tables

# Test Supabase (after setting up credentials)
curl http://localhost:3003/api/test-supabase
```

## Usage Examples

### Authentication
- **Local Development**: Uses local PostgreSQL for fast development
- **Production**: Can use Supabase for managed authentication and real-time features

### Data Storage
- **Chat Messages**: Store in local PostgreSQL for development, Supabase for production
- **User Preferences**: Sync between both databases
- **Brain Activities**: Local for testing, Supabase for analytics

## Switching Between Databases

### Use Local Only (Development)
```env
DB_MODE=local
DATABASE_URL="postgresql://postgres:1234@localhost:5432/baldsphere_db"
```

### Use Supabase Only (Production)
```env
DB_MODE=supabase
DATABASE_URL="postgresql://postgres:baldsphere1234@db.feyuzboonbqmavpbjvdi.supabase.co:5432/postgres"
```

### Use Hybrid (Recommended)
```env
DB_MODE=hybrid
DATABASE_URL="postgresql://postgres:1234@localhost:5432/baldsphere_db"
# Supabase as backup/additional features
```

## Benefits of Hybrid Setup

1. **Development Speed**: Use local PostgreSQL for fast development
2. **Production Ready**: Deploy with Supabase for managed database
3. **Backup Strategy**: Data can be synced between both
4. **Feature Testing**: Test locally before deploying to Supabase
5. **Offline Development**: Work without internet using local database

## Troubleshooting

### If you get 500 errors:
1. Check that at least one database is properly configured
2. Verify environment variables are correct
3. Ensure database tables exist in the database you're trying to use

### If Supabase connection fails:
1. Verify your Supabase project is active
2. Check that API keys are correct and not expired
3. Ensure your IP is allowed (Supabase has IP restrictions)

### If local PostgreSQL fails:
1. Ensure PostgreSQL is running on your machine
2. Verify database `baldsphere_db` exists
3. Check username/password are correct

## Next Steps

1. **Add your real Supabase credentials** to `.env.local`
2. **Create tables in Supabase** using one of the methods above
3. **Test both databases** work correctly
4. **Choose your preferred mode** for development

Your application will now work with both databases and automatically handle the complexity of switching between them!
