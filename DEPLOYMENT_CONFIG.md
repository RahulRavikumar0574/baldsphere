# Deployment Configuration

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration (if using PostgreSQL directly)
DATABASE_URL=your_database_url_here
```

## How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy the following values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Platform-Specific Configuration

### Vercel
1. Go to your project settings
2. Add environment variables in the "Environment Variables" section
3. Add all variables listed above

### Netlify
1. Go to Site settings > Environment variables
2. Add all variables listed above

### Railway
1. Go to your project
2. Add environment variables in the "Variables" tab
3. Add all variables listed above

## Optional Configuration

The following variables are optional and not needed for basic deployment:

```bash
# Ollama Service (not needed for deployment)
# OLLAMA_SERVICE_URL=http://localhost:5000
```

## Testing Configuration

To test locally:
1. Copy the environment variables to `.env.local`
2. Run `npm run dev`
3. The app should start without errors

## Troubleshooting

If you get "supabaseUrl is required" error:
1. Check that `NEXT_PUBLIC_SUPABASE_URL` is set
2. Ensure the URL starts with `https://`
3. Verify the Supabase project is active 