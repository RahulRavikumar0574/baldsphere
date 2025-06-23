// Database service for easy integration with brain visualization
import { query } from './hybrid-db';
import { ChatSession, ChatMessage, BrainActivity, User, ContactMessage } from '../types/database';

export class DatabaseService {
  
  // User operations
  static async createUser(email: string, name: string): Promise<User> {
    const result = await query(`
      INSERT INTO users (email, name) 
      VALUES ($1, $2) 
      ON CONFLICT (email) DO UPDATE SET name = $2
      RETURNING *
    `, [email, name]);
    return result.rows[0];
  }

  static async getUser(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  // Chat session operations
  static async createChatSession(userId: string, title?: string): Promise<ChatSession> {
    const result = await query(`
      INSERT INTO chat_sessions (user_id, title) 
      VALUES ($1, $2) 
      RETURNING *
    `, [userId, title || 'New Brain Chat']);
    return result.rows[0];
  }

  static async getChatSessions(userId: string, limit: number = 20): Promise<ChatSession[]> {
    const result = await query(`
      SELECT * FROM chat_sessions 
      WHERE user_id = $1 AND is_active = true
      ORDER BY updated_at DESC 
      LIMIT $2
    `, [userId, limit]);
    return result.rows;
  }

  // Chat message operations
  static async createChatMessage(
    sessionId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    brainRegions: string[] = []
  ): Promise<ChatMessage> {
    const result = await query(`
      INSERT INTO chat_messages (session_id, role, content, brain_regions) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [sessionId, role, content, brainRegions]);
    
    // Update session timestamp
    await query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
    
    return result.rows[0];
  }

  static async getChatMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const result = await query(`
      SELECT * FROM chat_messages 
      WHERE session_id = $1 
      ORDER BY created_at ASC 
      LIMIT $2
    `, [sessionId, limit]);
    return result.rows;
  }

  // Brain activity operations
  static async recordBrainActivity(
    sessionId: string,
    messageId: string,
    brainRegions: string[],
    activityType: string,
    durationMs?: number,
    arrowCount?: number
  ): Promise<BrainActivity> {
    const result = await query(`
      INSERT INTO brain_activities (session_id, message_id, brain_regions, activity_type, duration_ms, arrow_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [sessionId, messageId, brainRegions, activityType, durationMs, arrowCount || 0]);

    // Update brain region statistics
    for (const region of brainRegions) {
      await query(`
        INSERT INTO brain_region_stats (user_id, region_name, activation_count, total_duration_ms, last_activated)
        SELECT cs.user_id, $1, 1, $2, CURRENT_TIMESTAMP
        FROM chat_sessions cs WHERE cs.id = $3
        ON CONFLICT (user_id, region_name) 
        DO UPDATE SET 
          activation_count = brain_region_stats.activation_count + 1,
          total_duration_ms = brain_region_stats.total_duration_ms + $2,
          last_activated = CURRENT_TIMESTAMP
      `, [region, durationMs || 0, sessionId]);
    }

    return result.rows[0];
  }

  // Get brain statistics for a user
  static async getBrainStats(userId: string) {
    const result = await query(`
      SELECT 
        region_name,
        activation_count,
        total_duration_ms,
        last_activated
      FROM brain_region_stats 
      WHERE user_id = $1 
      ORDER BY activation_count DESC
    `, [userId]);

    const totalActivations = result.rows.reduce((sum, row) => sum + row.activation_count, 0);
    const mostActiveRegion = result.rows[0]?.region_name || 'None';
    const totalTime = result.rows.reduce((sum, row) => sum + parseInt(row.total_duration_ms), 0);

    return {
      total_activations: totalActivations,
      most_active_region: mostActiveRegion,
      total_chat_time_ms: totalTime,
      region_stats: result.rows
    };
  }

  // Helper: Get or create user by email
  static async getOrCreateUser(email: string, name: string): Promise<User> {
    let user = await this.getUser(email);
    if (!user) {
      user = await this.createUser(email, name);
    }
    return user;
  }

  // Helper: Create a complete chat interaction
  static async createChatInteraction(
    userEmail: string,
    userName: string,
    userMessage: string,
    assistantMessage: string,
    brainRegions: string[],
    activityType: string
  ) {
    // Get or create user
    const user = await this.getOrCreateUser(userEmail, userName);
    
    // Create or get active session
    let sessions = await this.getChatSessions(user.id, 1);
    let session = sessions[0];
    
    if (!session) {
      session = await this.createChatSession(user.id);
    }

    // Create user message
    const userMsg = await this.createChatMessage(session.id, 'user', userMessage);
    
    // Create assistant message with brain regions
    const assistantMsg = await this.createChatMessage(session.id, 'assistant', assistantMessage, brainRegions);
    
    // Record brain activity
    const activity = await this.recordBrainActivity(
      session.id,
      assistantMsg.id,
      brainRegions,
      activityType,
      undefined,
      brainRegions.length
    );

    return {
      user,
      session,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      brainActivity: activity
    };
  }

  // Contact message operations
  static async createContactMessage(
    name: string,
    email: string,
    subject: string,
    message: string,
    userId?: string
  ): Promise<ContactMessage> {
    const result = await query(
      'INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId || null, name, email, subject, message]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create contact message');
    }

    return result.rows[0];
  }

  static async getContactMessages(limit: number = 50, unreadOnly: boolean = false): Promise<ContactMessage[]> {
    let whereClause = '';
    if (unreadOnly) {
      whereClause = 'WHERE is_read = false';
    }

    const result = await query(`
      SELECT
        cm.*,
        u.name as user_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ${whereClause}
      ORDER BY cm.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  static async markContactMessageAsRead(messageId: string): Promise<ContactMessage> {
    const result = await query(`
      UPDATE contact_messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [messageId]);
    return result.rows[0];
  }
}
