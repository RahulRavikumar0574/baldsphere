import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if users table exists
    const usersTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // Check if user_preferences table exists
    const preferencesTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
      );
    `);

    let usersStructure = [];
    let preferencesStructure = [];

    if (usersTableCheck.rows[0].exists) {
      const usersInfo = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      usersStructure = usersInfo.rows;
    }

    if (preferencesTableCheck.rows[0].exists) {
      const preferencesInfo = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        ORDER BY ordinal_position;
      `);
      preferencesStructure = preferencesInfo.rows;
    }

    return NextResponse.json({
      success: true,
      data: {
        users_table_exists: usersTableCheck.rows[0].exists,
        user_preferences_table_exists: preferencesTableCheck.rows[0].exists,
        users_structure: usersStructure,
        preferences_structure: preferencesStructure
      },
      message: 'Database structure check completed'
    });

  } catch (error) {
    console.error('Error checking database structure:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check database structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
