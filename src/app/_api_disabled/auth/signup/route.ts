import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/hybrid-db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required'
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

    // Comprehensive password validation
    const passwordErrors = [];

    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }

    if (!/[a-z]/.test(password)) {
      passwordErrors.push('at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      passwordErrors.push('at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      passwordErrors.push('at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    if (passwordErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Password must contain ${passwordErrors.join(', ')}`
      }, { status: 400 });
    }

    // Check if user already exists
    let existingUserResult;
    try {
      existingUserResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      console.log('Supabase user existence check result:', existingUserResult);
    } catch (dbError) {
      console.error('Supabase user existence check error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error during user existence check',
        details: dbError instanceof Error ? dbError.message : dbError
      }, { status: 500 });
    }

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = userResult.rows[0];

    // Create default user preferences
    try {
      await query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [user.id]
      );
    } catch (prefsError) {
      console.warn('Failed to create user preferences:', prefsError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      message: 'Account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
