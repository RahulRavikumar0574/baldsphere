import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash
      })
      .select('id, name, email, created_at')
      .single();

    if (userError || !user) {
      throw new Error(`Failed to create user: ${userError?.message}`);
    }

    // Create default user preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id
      });

    if (prefsError) {
      console.warn('Failed to create user preferences:', prefsError.message);
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
