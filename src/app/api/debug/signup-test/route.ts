import { NextRequest, NextResponse } from 'next/server';
import { HybridDatabase } from '../../../../lib/hybrid-db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug signup test started');
    
    const body = await request.json();
    const { name, email, password } = body;
    console.log('📝 Received data:', { name, email, passwordLength: password?.length });

    // Check database availability first
    const available = HybridDatabase.getAvailableDatabases();
    console.log('🗄️ Database availability:', available);

    if (!available.local && !available.supabase) {
      return NextResponse.json({
        success: false,
        error: 'No database available',
        debug: { available }
      }, { status: 500 });
    }

    // Test basic database connection
    try {
      const testResult = await HybridDatabase.query('SELECT 1 as test');
      console.log('✅ Database connection test passed:', testResult);
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        debug: { 
          available,
          dbError: dbError instanceof Error ? dbError.message : 'Unknown DB error'
        }
      }, { status: 500 });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required',
        debug: { name: !!name, email: !!email, password: !!password }
      }, { status: 400 });
    }

    // Check if user already exists
    try {
      console.log('🔍 Checking if user exists...');
      const existingUserResult = await HybridDatabase.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      console.log('👤 Existing user check result:', existingUserResult);

      if (existingUserResult.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'User with this email already exists'
        }, { status: 409 });
      }
    } catch (userCheckError) {
      console.error('❌ User existence check failed:', userCheckError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check user existence',
        debug: { 
          userCheckError: userCheckError instanceof Error ? userCheckError.message : 'Unknown error'
        }
      }, { status: 500 });
    }

    // Hash password
    try {
      console.log('🔐 Hashing password...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      console.log('✅ Password hashed successfully');

      // Create user
      console.log('👤 Creating user...');
      const userResult = await HybridDatabase.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email, passwordHash]
      );
      console.log('✅ User created:', userResult);

      if (userResult.rows.length === 0) {
        throw new Error('Failed to create user - no rows returned');
      }

      const user = userResult.rows[0];

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        message: 'Account created successfully',
        debug: { available }
      }, { status: 201 });

    } catch (createError) {
      console.error('❌ User creation failed:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        debug: { 
          available,
          createError: createError instanceof Error ? createError.message : 'Unknown error'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Debug signup test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
