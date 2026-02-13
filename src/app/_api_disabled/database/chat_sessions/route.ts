import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 100');
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} chat sessions`
    });

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to fetch chat sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
