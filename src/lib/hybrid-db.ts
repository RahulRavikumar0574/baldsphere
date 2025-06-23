// Hybrid database service that can use both Supabase and local PostgreSQL
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Database mode configuration
type DatabaseMode = 'local' | 'supabase' | 'hybrid';
const DB_MODE = (process.env.DB_MODE as DatabaseMode) || 'hybrid';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabase: any = null;
let supabaseAdmin: any = null;

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  if (supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key_here') {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
}

// Local PostgreSQL pool
let localPool: Pool | null = null;

// Initialize local PostgreSQL only if credentials are available
if (process.env.POSTGRES_HOST && process.env.POSTGRES_PASSWORD) {
  localPool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'baldsphere_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  localPool.on('connect', () => {
    console.log('✅ Connected to local PostgreSQL database');
  });

  localPool.on('error', (err) => {
    console.error('❌ Local PostgreSQL error:', err);
  });
}

// Database interface for consistent API
export interface DatabaseResult {
  rows: any[];
  rowCount: number;
}

// Hybrid database service
export class HybridDatabase {
  
  // Check which databases are available
  static getAvailableDatabases() {
    return {
      supabase: !!supabase,
      local: !!localPool,
      mode: DB_MODE
    };
  }

  // Execute query on local PostgreSQL
  static async queryLocal(text: string, params?: any[]): Promise<DatabaseResult> {
    if (!localPool) {
      throw new Error('Local PostgreSQL not configured');
    }

    const start = Date.now();
    try {
      const res = await localPool.query(text, params);
      const duration = Date.now() - start;
      console.log('🔍 Local PostgreSQL query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
      return {
        rows: res.rows,
        rowCount: res.rowCount || 0
      };
    } catch (error) {
      console.error('❌ Local PostgreSQL query error:', error);
      throw error;
    }
  }

  // Execute query on Supabase
  static async querySupabase(table: string, operation: 'select' | 'insert' | 'update' | 'delete', data?: any, filters?: any): Promise<DatabaseResult> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      let query = supabase.from(table);
      
      switch (operation) {
        case 'select':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          const { data: selectData, error: selectError } = await query.select();
          if (selectError) throw selectError;
          return { rows: selectData || [], rowCount: selectData?.length || 0 };

        case 'insert':
          const { data: insertData, error: insertError } = await query.insert(data).select();
          if (insertError) throw insertError;
          return { rows: insertData || [], rowCount: insertData?.length || 0 };

        case 'update':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          const { data: updateData, error: updateError } = await query.update(data).select();
          if (updateError) throw updateError;
          return { rows: updateData || [], rowCount: updateData?.length || 0 };

        case 'delete':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          const { data: deleteData, error: deleteError } = await query.delete().select();
          if (deleteError) throw deleteError;
          return { rows: deleteData || [], rowCount: deleteData?.length || 0 };

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }
  }

  // Smart query that chooses the best database based on mode and availability
  static async query(text: string, params?: any[]): Promise<DatabaseResult> {
    const available = this.getAvailableDatabases();
    
    switch (DB_MODE) {
      case 'local':
        if (available.local) {
          return this.queryLocal(text, params);
        }
        throw new Error('Local database not available');

      case 'supabase':
        if (available.supabase) {
          // For raw SQL queries on Supabase, we'd need to use the REST API or convert to Supabase operations
          // For now, fall back to local if available
          if (available.local) {
            console.warn('⚠️ Raw SQL query on Supabase not supported, using local database');
            return this.queryLocal(text, params);
          }
          throw new Error('Supabase raw SQL queries not supported in this implementation');
        }
        throw new Error('Supabase not available');

      case 'hybrid':
      default:
        // Try local first, then Supabase
        if (available.local) {
          return this.queryLocal(text, params);
        } else if (available.supabase) {
          console.warn('⚠️ Local database not available, would need Supabase implementation for:', text.substring(0, 50));
          throw new Error('Hybrid mode: Local database preferred but not available, Supabase raw SQL not implemented');
        }
        throw new Error('No database available');
    }
  }

  // Get Supabase client for direct operations
  static getSupabase() {
    return supabase;
  }

  // Get Supabase admin client
  static getSupabaseAdmin() {
    return supabaseAdmin;
  }

  // Get local PostgreSQL pool
  static getLocalPool() {
    return localPool;
  }
}

// Export the query function for backward compatibility
export const query = HybridDatabase.query.bind(HybridDatabase);

// Export individual database clients
export { supabase, supabaseAdmin, localPool };

// Default export
export default HybridDatabase;
