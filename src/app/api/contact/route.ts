import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { DatabaseService } from '../../../lib/database-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, userId } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and message are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Insert contact message using DatabaseService
    const contactMessage = await DatabaseService.createContactMessage(
      name,
      email,
      subject || 'General Inquiry',
      message,
      userId
    );

    return NextResponse.json({
      success: true,
      data: {
        id: contactMessage.id,
        created_at: contactMessage.created_at
      },
      message: 'Your message has been sent successfully! We\'ll get back to you soon.'
    }, { status: 201 });

  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let whereClause = '';
    if (unreadOnly) {
      whereClause = 'WHERE is_read = false';
    }

    const result = await query(`
      SELECT 
        cm.*,
        u.name as user_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ${whereClause}
      ORDER BY cm.created_at DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} contact messages`
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
