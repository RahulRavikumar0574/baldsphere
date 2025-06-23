import { NextRequest, NextResponse } from 'next/server';
import { HybridDatabase } from '../../../lib/hybrid-db';

export async function GET(request: NextRequest) {
  try {
    const available = HybridDatabase.getAvailableDatabases();
    
    const result = {
      success: true,
      databases: available,
      tests: {
        local: null as any,
        supabase: null as any
      }
    };

    // Test local database if available
    if (available.local) {
      try {
        const localTest = await HybridDatabase.queryLocal(
          'SELECT NOW() as current_time, \'local\' as database_type'
        );
        result.tests.local = {
          success: true,
          data: localTest.rows[0],
          message: 'Local PostgreSQL connection successful'
        };
      } catch (error) {
        result.tests.local = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Local PostgreSQL connection failed'
        };
      }
    } else {
      result.tests.local = {
        success: false,
        message: 'Local PostgreSQL not configured'
      };
    }

    // Test Supabase if available
    if (available.supabase) {
      try {
        const supabaseClient = HybridDatabase.getSupabase();
        
        // Test with a simple query - check if users table exists
        const { data, error } = await supabaseClient
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          // If users table doesn't exist, that's okay for testing connection
          if (error.message.includes('relation "users" does not exist')) {
            result.tests.supabase = {
              success: true,
              message: 'Supabase connection successful (users table not created yet)',
              note: 'Run database setup to create tables'
            };
          } else {
            throw error;
          }
        } else {
          result.tests.supabase = {
            success: true,
            data: { userCount: data?.length || 0 },
            message: 'Supabase connection and users table successful'
          };
        }
      } catch (error) {
        result.tests.supabase = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Supabase connection failed'
        };
      }
    } else {
      result.tests.supabase = {
        success: false,
        message: 'Supabase not configured or credentials missing'
      };
    }

    // Overall status
    const hasWorkingDatabase = result.tests.local?.success || result.tests.supabase?.success;
    
    return NextResponse.json({
      ...result,
      overall_status: hasWorkingDatabase ? 'At least one database working' : 'No working databases',
      recommendations: getRecommendations(result.tests)
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test databases',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRecommendations(tests: any) {
  const recommendations = [];
  
  if (!tests.local?.success) {
    recommendations.push('Set up local PostgreSQL: Ensure PostgreSQL is running and credentials are correct in .env.local');
  }
  
  if (!tests.supabase?.success) {
    recommendations.push('Set up Supabase: Add your real Supabase credentials to .env.local');
  }
  
  if (!tests.local?.success && !tests.supabase?.success) {
    recommendations.push('URGENT: No working database found. Set up at least one database to use the application.');
  }
  
  if (tests.supabase?.success && tests.supabase?.note) {
    recommendations.push('Create Supabase tables: Run the database setup script in Supabase SQL editor');
  }
  
  return recommendations;
}
