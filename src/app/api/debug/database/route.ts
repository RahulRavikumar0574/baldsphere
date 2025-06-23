import { NextRequest, NextResponse } from 'next/server';
import { HybridDatabase } from '../../../../lib/hybrid-db';

export async function GET(request: NextRequest) {
  try {
    // Check database availability
    const available = HybridDatabase.getAvailableDatabases();
    
    // Test database connection
    let connectionTest = null;
    try {
      const result = await HybridDatabase.query('SELECT 1 as test');
      connectionTest = {
        success: true,
        result: result.rows[0]
      };
    } catch (error) {
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      POSTGRES_DB: !!process.env.POSTGRES_DB,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_PORT: !!process.env.POSTGRES_PORT,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DB_MODE: process.env.DB_MODE || 'hybrid'
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseAvailability: available,
      connectionTest,
      environmentVariables: envCheck
    });

  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
