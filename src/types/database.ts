// Database types for BaldSphere Brain App

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  brain_regions: string[]; 
  created_at: Date;
}

export interface BrainActivity {
  id: string;
  session_id: string;
  message_id: string;
  brain_regions: string[];
  activity_type: string; 
  duration_ms?: number;
  arrow_count: number;
  created_at: Date;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  arrow_size: number;
  brain_model: string;
  show_debug_info: boolean;
  auto_hide_arrows: boolean;
  preferred_theme: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrainRegionStats {
  id: string;
  user_id: string;
  region_name: string;
  activation_count: number;
  total_duration_ms: number;
  last_activated: Date;
  created_at: Date;
}

export interface ContactMessage {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatHistoryResponse {
  sessions: ChatSession[];
  total_count: number;
}

export interface BrainStatsResponse {
  total_activations: number;
  most_active_region: string;
  total_chat_time_ms: number;
  region_stats: BrainRegionStats[];
}
