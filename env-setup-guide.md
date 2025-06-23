# Environment Setup Guide for BaldSphere

## The 500 Internal Server Error Issue

The 500 error you're experiencing is likely due to missing Supabase environment variables. Your code is trying to connect to Supabase, but the required environment variables are not configured.

## Current Issues in .env.local

1. **Missing Supabase Variables**: Your authentication code uses Supabase, but these variables are missing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Database URL Mismatch**: You have a local PostgreSQL URL, but your code expects Supabase.

## Option 1: Use Local PostgreSQL (Recommended for Development)

If you want to use your local PostgreSQL database, you need to update your authentication code to use direct PostgreSQL instead of Supabase.

### Update your .env.local:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:1234@localhost:5432/baldsphere_db"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=baldsphere_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234

# Authentication
NEXTAUTH_SECRET=your_secret_key_here_minimum_32_characters_long_for_security
NEXTAUTH_URL=http://localhost:3000

# OpenAI (if using AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Steps to fix the authentication:

1. **Execute the SQL script in pgAdmin**:
   - Open pgAdmin
   - Connect to your local PostgreSQL server
   - Open the `database-setup.sql` file I created
   - Execute it to create all tables

2. **Update authentication code** to use PostgreSQL directly instead of Supabase

## Option 2: Use Supabase (Cloud Database)

If you prefer to use Supabase:

1. **Create a Supabase project**:
   - Go to https://supabase.com
   - Create a new project
   - Get your project URL and API keys

2. **Update your .env.local**:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Authentication
NEXTAUTH_SECRET=your_secret_key_here_minimum_32_characters_long_for_security
NEXTAUTH_URL=http://localhost:3000

# OpenAI (if using AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Run the Prisma migration**:
```bash
npx prisma db push
```

## Quick Fix for Immediate Testing

To quickly fix the 500 error for testing, add these temporary Supabase variables to your .env.local:

```env
# Temporary Supabase variables (replace with real ones)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_key
```

This will prevent the environment variable errors, but authentication won't work until you set up a real database.

## Database Setup Instructions

1. **Open pgAdmin**
2. **Connect to your PostgreSQL server** (localhost:5432)
3. **Create database** (if not exists): `baldsphere_db`
4. **Open Query Tool** in pgAdmin
5. **Copy and paste** the entire content of `database-setup.sql`
6. **Execute the script** (F5 or click Execute)
7. **Verify tables were created** by checking the Tables section in pgAdmin

## Verification

After setting up the database, you should see these tables in pgAdmin:
- users
- user_preferences  
- chat_sessions
- chat_messages
- brain_activities
- brain_region_stats
- contact_messages

## Next Steps

1. Fix the environment variables
2. Execute the database setup script
3. Test the login functionality
4. If still having issues, check the browser console and server logs for specific error messages
