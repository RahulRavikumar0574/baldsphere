import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Supabase login started');
    
    const supabase = getSupabaseAdmin();
    
    const body = await request.json();
    const { email, password } = body;
    console.log('📝 Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    console.log('🔍 Finding user...');
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (findError || !user) {
      console.log('❌ User not found:', findError);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      }, { status: 401 });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log('❌ Password mismatch');
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Update last login
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    } catch (updateError) {
      console.warn('⚠️ Failed to update last login:', updateError);
    }

    console.log('✅ Login successful for user:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Login successful'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Supabase login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
