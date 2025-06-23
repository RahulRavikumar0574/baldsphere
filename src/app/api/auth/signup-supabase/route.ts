import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Supabase signup started');
    
    const body = await request.json();
    const { name, email, password } = body;
    console.log('📝 Received data:', { name, email, passwordLength: password?.length });

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
    console.log('🔍 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ User existence check failed:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check user existence'
      }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    console.log('👤 Creating user...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash
      })
      .select('id, name, email, created_at')
      .single();

    if (createError) {
      console.error('❌ User creation failed:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: createError.message
      }, { status: 500 });
    }

    console.log('✅ User created successfully:', newUser);

    // Create default user preferences
    try {
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: newUser.id
        });

      if (prefsError) {
        console.warn('⚠️ Failed to create user preferences:', prefsError);
      }
    } catch (prefsError) {
      console.warn('⚠️ Failed to create user preferences:', prefsError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at
      },
      message: 'Account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Supabase signup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
