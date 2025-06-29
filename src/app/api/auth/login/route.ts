import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/hybrid-db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    let userResult;
    try {
      userResult = await query(
        'SELECT id, name, email, password_hash, is_active FROM users WHERE email = $1',
        [email]
      );
      console.log('Supabase user lookup result:', userResult);
    } catch (dbError) {
      console.error('Supabase user lookup error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error during user lookup',
        details: dbError instanceof Error ? dbError.message : dbError
      }, { status: 500 });
    }

    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
