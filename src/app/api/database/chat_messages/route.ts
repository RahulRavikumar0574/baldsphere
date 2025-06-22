import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const sessionId = searchParams.get('sessionId');

    let result;

    if (sessionId) {
      result = await query(`
        SELECT cm.*, cs.user_id
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        WHERE cm.session_id = $1
        ORDER BY cm.created_at ASC
      `, [sessionId]);
    } else if (userEmail) {
      result = await query(`
        SELECT cm.*, cs.user_id, cs.title
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        JOIN users u ON cs.user_id = u.id
        WHERE u.email = $1
        ORDER BY cm.created_at DESC
        LIMIT 100
      `, [userEmail]);
    } else {
      result = await query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 100');
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} chat messages`
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to fetch chat messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, userMessage, assistantMessage, brainRegions, activityType } = body;

    if (!userEmail || !userName || !userMessage || !assistantMessage) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userEmail, userName, userMessage, assistantMessage'
      }, { status: 400 });
    }

    const result = await DatabaseService.createChatInteraction(
      userEmail,
      userName,
      userMessage,
      assistantMessage,
      brainRegions || [],
      activityType || 'brain_query'
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Chat interaction saved successfully'
    });

  } catch (error) {
    console.error('Error saving chat interaction:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save chat interaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
