import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { BrainActivity, DatabaseResponse } from '../../../../types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, message_id, brain_regions, activity_type, duration_ms, arrow_count } = body;

    if (!session_id || !brain_regions || !Array.isArray(brain_regions)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: session_id, brain_regions'
      }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO brain_activities (session_id, message_id, brain_regions, activity_type, duration_ms, arrow_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [session_id, message_id, brain_regions, activity_type, duration_ms || null, arrow_count || 0]);

    const activity: BrainActivity = result.rows[0];

    // Update brain region statistics
    for (const region of brain_regions) {
      await query(`
        INSERT INTO brain_region_stats (user_id, region_name, activation_count, total_duration_ms, last_activated)
        SELECT cs.user_id, $1, 1, $2, CURRENT_TIMESTAMP
        FROM chat_sessions cs WHERE cs.id = $3
        ON CONFLICT (user_id, region_name) 
        DO UPDATE SET 
          activation_count = brain_region_stats.activation_count + 1,
          total_duration_ms = brain_region_stats.total_duration_ms + $2,
          last_activated = CURRENT_TIMESTAMP
      `, [region, duration_ms || 0, session_id]);
    }

    const response: DatabaseResponse<BrainActivity> = {
      success: true,
      data: activity,
      message: 'Brain activity recorded successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating brain activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record brain activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!session_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing session_id parameter'
      }, { status: 400 });
    }

    const result = await query(`
      SELECT * FROM brain_activities 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [session_id, limit]);

    const activities: BrainActivity[] = result.rows;

    const response: DatabaseResponse<BrainActivity[]> = {
      success: true,
      data: activities,
      message: `Found ${activities.length} brain activities`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching brain activities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch brain activities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
