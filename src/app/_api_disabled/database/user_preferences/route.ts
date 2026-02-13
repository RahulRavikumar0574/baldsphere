import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM user_preferences ORDER BY created_at DESC LIMIT 100');
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} user preferences`
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to fetch user preferences',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
