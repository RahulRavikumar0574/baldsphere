"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import brainData from "../../myBrainData";
import BrainCanvas, { BrainCanvasRef } from '@/components/BrainCanvas';
import { BrainDataItem } from '../../types';
import {
  ChatSession,
  createChatSession,
  addMessageToSession,
  saveChatSession,
  isStorageAvailable
} from "@/utils/chatStorage";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: "user" | "assistant"; text: string }[]>([
    { sender: "assistant", text: "Hi! I'm your Brain Assistant. Type any action (like 'think', 'run', 'sing', or 'cook') and I'll show you which brain regions are responsible for it. Type 'help' for more examples!" }
  ]);
  const [input, setInput] = useState("");
  const [highlightedRegions, setHighlightedRegions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const brainCanvasRef = useRef<BrainCanvasRef>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  async function loadChatHistory() {
    if (!user) return;

    try {
      const response = await fetch(`/api/database/chat_messages?userEmail=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const dbMessages = result.data.map((msg: any) => ({
          sender: msg.role as "user" | "assistant",
          text: msg.content
        }));

        setMessages(prev => [
          prev[0], // Keep the initial assistant message
          ...dbMessages.slice(-10) // Show last 10 messages from database
        ]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Semantic matching function
  async function findBrainDataSemantic(userInput: string): Promise<{ 
    found: BrainDataItem | null; 
    normalized: string | null; 
    confidence: string;
    brainRegions: string[];
  }> {
    try {
      const response = await fetch('/api/brain/semantic-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });

      if (!response.ok) {
        console.error('Semantic matching failed:', response.status);
        // Fallback to original matching
        const found = findBrainData(userInput);
        return { 
          found, 
          normalized: found?.keyword || null, 
          confidence: 'fallback',
          brainRegions: found?.region || []
        };
      }

      const data = await response.json();
      
      if (data.success && data.data.normalized) {
        // Find the brain data item for the normalized word
        const found = (brainData as BrainDataItem[]).find(
          (item) => item.keyword.toLowerCase() === data.data.normalized.toLowerCase()
        );
        
        return {
          found: found || null,
          normalized: data.data.normalized,
          confidence: data.data.confidence,
          brainRegions: data.data.brainRegions || (found?.region || [])
        };
      }

      return { found: null, normalized: null, confidence: 'none', brainRegions: [] };
    } catch (error) {
      console.error('Error in semantic matching:', error);
      // Fallback to original matching
      const found = findBrainData(userInput);
      return { 
        found, 
        normalized: found?.keyword || null, 
        confidence: 'fallback',
        brainRegions: found?.region || []
      };
    }
  }

  // Keep the original findBrainData function as fallback
  function findBrainData(userInput: string): BrainDataItem | null {
    const input = userInput.toLowerCase().trim();

    // First, try exact matches
    let found = (brainData as BrainDataItem[]).find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return input === cleanKeyword || input === keyword;
      }
    );

    if (found) return found;

    // Then try partial matches
    found = (brainData as BrainDataItem[]).find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return input.includes(cleanKeyword) && cleanKeyword.length > 2;
      }
    );

    if (found) return found;

    // Finally try keyword contains user input
    found = (brainData as BrainDataItem[]).find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return cleanKeyword.includes(input) && input.length > 2;
      }
    );

    return found || null;
  }

  async function saveChatToDatabase(userMessage: string, assistantMessage: string, brainRegions: string[]) {
    if (!user) return;

    try {
      const response = await fetch('/api/database/chat_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          userMessage,
          assistantMessage,
          brainRegions,
          activityType: 'brain_query'
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to save to database:', result.error);
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput) return;

    // Handle special commands
    if (userInput.toLowerCase() === 'help' || userInput.toLowerCase() === 'examples') {
      const helpResponse = `Here are some actions you can try:

🧠 **Thinking**: think, solve, remember, focus, decide
🏃 **Movement**: run, walk, jump, dance, swim, climb
🎵 **Sound**: sing, talk, whisper, shout, listen
👁️ **Vision**: see, watch, read, look, stare
🍽️ **Daily**: eat, cook, sleep, shower, brush
🎨 **Creative**: paint, write, draw, play, create
💪 **Sports**: exercise, lift, throw, kick, catch

💡 **Smart Matching**: I can understand synonyms and related words!
   • "jogging" → finds "run"
   • "sprinting" → finds "run" 
   • "taking a stroll" → finds "walk"

Type any action to see which brain regions are involved!`;

      setMessages((prev) => [
        ...prev,
        { sender: "user", text: input },
        { sender: "assistant", text: helpResponse }
      ]);

      if (user) {
        await saveChatToDatabase(input, helpResponse, []);
      }

      setInput("");
      return;
    }

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input }
    ]);

    // Clear input and show loading
    setInput("");
    setIsLoading(true);

    // Add loading message
    setMessages((prev) => [
      ...prev,
      { sender: "assistant", text: " Analyzing your request... Please wait while I process this with semantic matching." }
    ]);

    try {
      // Use semantic matching
      const { found, normalized, confidence, brainRegions } = await findBrainDataSemantic(userInput);

      if (found) {
        setHighlightedRegions(brainRegions);
      } else {
        setHighlightedRegions([]); // Clear highlights if nothing is found
      }

      let assistantResponse: string;
      
      if (found) {
        const regionText = brainRegions.join(" & ");
        const confidenceText = confidence === 'high' ? ' (exact match)' : 
                              confidence === 'medium' ? ' (semantic match)' : 
                              confidence === 'fallback' ? ' (fallback match)' : '';
        
        assistantResponse = `The ${regionText} lobe${brainRegions.length > 1 ? 's' : ''} are responsible for "${normalized || found.keyword}"${confidenceText}.`;
      } else {
        assistantResponse = `Sorry, I don't have data for "${userInput}". Try typing "help" to see examples, or try words like 'think', 'run', 'sing', 'dance', 'read', 'write', or 'listen'.`;
      }

      // Replace loading message with actual response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading message
        { sender: "assistant", text: assistantResponse }
      ]);

      // Save to database
      if (user) {
        await saveChatToDatabase(userInput, assistantResponse, brainRegions);
      }

      // Save to localStorage as backup
      if (isStorageAvailable()) {
        let session = currentSession;

        if (!session) {
          session = createChatSession(userInput);
          setCurrentSession(session);
        }

        session = addMessageToSession(session, "user", userInput);
        session = addMessageToSession(session, "assistant", assistantResponse);

        saveChatSession(session);
        setCurrentSession(session);
      }

    } catch (error) {
      console.error('Error processing request:', error);
      
      // Replace loading message with error response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading message
        { sender: "assistant", text: "Sorry, I encountered an error while processing your request. Please try again or use simpler terms." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Reset function for both arrows and camera position
  const handleReset = () => {
    setHighlightedRegions([]); // Clear highlighted regions/arrows
    if (brainCanvasRef.current) {
      brainCanvasRef.current.resetCamera(); // Reset camera position and zoom
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 pt-20 lg:pt-24 overflow-hidden">
        <div className="flex flex-col lg:flex-row w-full min-h-0">
          {/* 3D Model Section */}
          <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-4 lg:p-6 min-w-0 min-h-0">
            <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden relative">
              {/* Brain Canvas Container */}
              <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <BrainCanvas ref={brainCanvasRef} highlightedRegions={highlightedRegions} />
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg border border-gray-200 flex items-center gap-2"
                title="Reset brain model and camera position"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 lg:hidden px-4">
              <p>💡 Try: "think", "run", "sing", "dance", "read", "write", "listen", "cook"</p>
              <p className="mt-1 text-xs text-gray-500">Smart matching: "jogging" → "run", "sprinting" → "run"</p>
              <p className="mt-1 text-xs text-gray-500">Type "help" for more examples</p>
            </div>






          </main>

          {/* Chat Sidebar */}
          <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shadow-lg h-[600px] lg:h-[750px]">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 lg:p-6 border-b bg-gradient-to-r from-yellow-50 to-yellow-100 flex-shrink-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Brain Assistant</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Ask me about any action!</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
              <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[280px] sm:max-w-xs text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-sm transition-all ${
                      msg.sender === "user"
                        ? "self-end bg-yellow-400 text-black font-medium"
                        : "self-start bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <form className="p-3 sm:p-4 lg:p-6 border-t bg-gray-50 flex-shrink-0" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type any action: think, run, sing, cook, read..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-xs sm:text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-white w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xl sm:text-2xl lg:text-3xl leading-none"
                  disabled={!input.trim() || isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="block leading-none">→</span>
                  )}
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}