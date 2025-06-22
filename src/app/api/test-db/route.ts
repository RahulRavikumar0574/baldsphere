import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as current_time');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result.rows[0].current_time,
        database_url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        postgres_host: process.env.POSTGRES_HOST || 'Not set'
      }
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      env_check: {
        database_url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        postgres_host: process.env.POSTGRES_HOST || 'Not set',
        postgres_user: process.env.POSTGRES_USER || 'Not set'
      }
    }, { status: 500 });
  }
}
