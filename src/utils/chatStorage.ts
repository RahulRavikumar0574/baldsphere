export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

const STORAGE_KEY = "baldmann-chat-sessions";

export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateSessionName(firstMessage: string): string {
  if (!firstMessage) return "New Chat";
  
  const cleanMessage = firstMessage.trim().slice(0, 30);
  return cleanMessage.length < firstMessage.trim().length 
    ? cleanMessage + "..." 
    : cleanMessage;
}

export function saveChatSession(session: ChatSession): void {
  try {
    const existingSessions = loadChatSessions();
    const sessionIndex = existingSessions.findIndex(s => s.id === session.id);
    
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = session;
    } else {
      existingSessions.push(session);
    }
    
    existingSessions.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSessions));
  } catch (error) {
    console.error("Error saving chat session:", error);
  }
}

export function loadChatSessions(): ChatSession[] {
  try {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    if (!savedSessions) return [];
    
    const parsedSessions = JSON.parse(savedSessions);
    return parsedSessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      lastUpdated: new Date(session.lastUpdated),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error("Error loading chat sessions:", error);
    return [];
  }
}

export function deleteChatSession(sessionId: string): void {
  try {
    const sessions = loadChatSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
  } catch (error) {
    console.error("Error deleting chat session:", error);
  }
}

export function clearAllChatSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing chat sessions:", error);
  }
}

export function createChatSession(firstUserMessage: string): ChatSession {
  const now = new Date();
  return {
    id: generateSessionId(),
    name: generateSessionName(firstUserMessage),
    messages: [],
    createdAt: now,
    lastUpdated: now
  };
}

export function addMessageToSession(
  session: ChatSession, 
  sender: "user" | "assistant", 
  text: string
): ChatSession {
  const newMessage: ChatMessage = {
    sender,
    text,
    timestamp: new Date()
  };
  
  const updatedSession: ChatSession = {
    ...session,
    messages: [...session.messages, newMessage],
    lastUpdated: new Date()
  };
  
  return updatedSession;
}

export function getMostRecentSession(): ChatSession | null {
  const sessions = loadChatSessions();
  return sessions.length > 0 ? sessions[0] : null;
}

export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
