import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const messages = await DatabaseService.getContactMessages(limit, unreadOnly);
    
    return NextResponse.json({
      success: true,
      data: messages,
      message: `Found ${messages.length} contact messages`
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to fetch contact messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, markAsRead } = body;

    if (!messageId) {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required'
      }, { status: 400 });
    }

    if (markAsRead) {
      const updatedMessage = await DatabaseService.markContactMessageAsRead(messageId);
      
      return NextResponse.json({
        success: true,
        data: updatedMessage,
        message: 'Message marked as read'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No valid action specified'
    }, { status: 400 });

  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update contact message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
