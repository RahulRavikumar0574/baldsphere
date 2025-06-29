import { createClient } from '@supabase/supabase-js';

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

// Database interface for consistent API
export interface DatabaseResult {
  rows: any[];
  rowCount: number;
}

// Supabase database service
export class SupabaseDatabase {
  
  // Check if Supabase is available
  static isAvailable() {
    return !!supabase && !!supabaseAdmin;
  }

  // Execute query on Supabase using RPC (for custom SQL)
  static async queryRPC(functionName: string, params?: any): Promise<DatabaseResult> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    try {
      const { data, error } = await supabaseAdmin.rpc(functionName, params);
      if (error) throw error;
      
      return {
        rows: data || [],
        rowCount: data?.length || 0
      };
    } catch (error) {
      console.error('❌ Supabase RPC error:', error);
      throw error;
    }
  }

  // Execute query on Supabase table operations
  static async queryTable(table: string, operation: 'select' | 'insert' | 'update' | 'delete', data?: any, filters?: any): Promise<DatabaseResult> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    try {
      let query = supabaseAdmin.from(table);
      
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
      console.error('❌ Supabase table query error:', error);
      throw error;
    }
  }

  // Smart query that tries to convert SQL to Supabase operations
  static async query(text: string, params?: any[]): Promise<DatabaseResult> {
    if (!supabaseAdmin) {
      throw new Error('Supabase not configured. Please add your Supabase credentials to .env.local');
    }

    const sql = text.toLowerCase().trim();

    // Handle SELECT ... WHERE email = $1
    const selectWhereEmail = sql.match(/select (.+) from (\w+) where email = \$1/);
    if (selectWhereEmail && params && params.length === 1) {
      const tableName = selectWhereEmail[2];
      const columns = selectWhereEmail[1].split(',').map(s => s.trim());
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select(columns.join(','))
        .eq('email', params[0]);
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }

    // Handle UPDATE ... SET last_login = CURRENT_TIMESTAMP WHERE id = $1
    const updateLastLogin = sql.match(/update (\w+) set last_login = current_timestamp where id = \$1/);
    if (updateLastLogin && params && params.length === 1) {
      const tableName = updateLastLogin[1];
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .update({ last_login: new Date().toISOString() })
        .eq('id', params[0])
        .select();
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }

    // Simple SQL to Supabase operation mapping
    // Handle simple SELECT queries
    if (sql.startsWith('select')) {
      // Extract table name from SELECT query
      const tableMatch = sql.match(/from\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        return this.queryTable(tableName, 'select');
      }
    }
    
    // Handle simple INSERT queries
    if (sql.startsWith('insert')) {
      const tableMatch = sql.match(/into\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        // Extract values from params or parse SQL
        const data = params && params.length > 0 ? params[0] : {};
        return this.queryTable(tableName, 'insert', data);
      }
    }

    // For complex queries, we'll need to implement specific handlers
    // For now, throw an error with helpful message
    throw new Error(`Complex SQL queries not yet supported in Supabase mode. Query: ${text.substring(0, 50)}...`);
  }

  // Get Supabase client for direct operations
  static getSupabase() {
    return supabase;
  }

  // Get Supabase admin client
  static getSupabaseAdmin() {
    return supabaseAdmin;
  }
}

// Export the query function for backward compatibility
export const query = SupabaseDatabase.query.bind(SupabaseDatabase);

// Export individual database clients
export { supabase, supabaseAdmin };

// Default export
export default SupabaseDatabase; 