import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    // Create contact_messages table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) DEFAULT 'General Inquiry',
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
    `);

    // Create trigger function for updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger
    await query(`
      DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
      CREATE TRIGGER update_contact_messages_updated_at
          BEFORE UPDATE ON contact_messages
          FOR EACH ROW
          EXECUTE FUNCTION update_contact_messages_updated_at();
    `);

    return NextResponse.json({
      success: true,
      message: 'Contact messages table created successfully with indexes and triggers'
    });

  } catch (error) {
    console.error('Error creating contact_messages table:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create contact_messages table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if table exists
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_messages'
      );
    `);

    const tableExists = result.rows[0].exists;

    if (tableExists) {
      // Get table info
      const tableInfo = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        ORDER BY ordinal_position;
      `);

      return NextResponse.json({
        success: true,
        data: {
          table_exists: true,
          columns: tableInfo.rows
        },
        message: 'Contact messages table exists'
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          table_exists: false,
          columns: []
        },
        message: 'Contact messages table does not exist'
      });
    }

  } catch (error) {
    console.error('Error checking contact_messages table:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check contact_messages table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
