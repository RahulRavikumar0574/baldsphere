import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM brain_region_stats ORDER BY activation_count DESC LIMIT 100');
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} brain region stats`
    });

  } catch (error) {
    console.error('Error fetching brain region stats:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to fetch brain region stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
