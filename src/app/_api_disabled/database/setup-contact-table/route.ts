import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'src/lib/contact-messages-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema SQL
    await query(schemaSql);

    return NextResponse.json({
      success: true,
      message: 'Contact messages table created successfully'
    });

  } catch (error) {
    console.error('Error setting up contact messages table:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup contact messages table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if table exists and get its structure
    const tableInfo = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'contact_messages' 
      ORDER BY ordinal_position;
    `);

    const indexInfo = await query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'contact_messages';
    `);

    return NextResponse.json({
      success: true,
      data: {
        table_exists: tableInfo.rows.length > 0,
        columns: tableInfo.rows,
        indexes: indexInfo.rows
      },
      message: `Contact messages table ${tableInfo.rows.length > 0 ? 'exists' : 'does not exist'}`
    });

  } catch (error) {
    console.error('Error checking contact messages table:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check contact messages table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
