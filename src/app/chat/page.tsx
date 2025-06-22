"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import brainData from "../../myBrainData";
import BrainCanvas from '@/components/BrainCanvas';
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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Enhanced matching function to find brain data
  function findBrainData(userInput: string): BrainDataItem | null {
    const input = userInput.toLowerCase().trim();

    // First, try exact matches
    let found = (brainData as BrainDataItem[]).find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        // Remove parenthetical explanations for matching
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return input === cleanKeyword || input === keyword;
      }
    );

    if (found) return found;

    // Then try partial matches - user input contains keyword
    found = (brainData as BrainDataItem[]).find(
      (item) => {
        const keyword = item.keyword.toLowerCase();
        const cleanKeyword = keyword.replace(/\([^)]*\)/g, '').trim();
        return input.includes(cleanKeyword) && cleanKeyword.length > 2;
      }
    );

    if (found) return found;

    // Finally try keyword contains user input (for shorter user inputs)
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

    const found = findBrainData(userInput);

    if (found) {
      setHighlightedRegions(found.region);
    } else {
      setHighlightedRegions([]); // Clear highlights if nothing is found
    }

    const assistantResponse = found
      ? `The ${found.region.join(" & ")} lobe${found.region.length > 1 ? 's' : ''} are responsible for "${found.keyword.replace(/\([^)]*\)/g, '').trim()}".`
      : `Sorry, I don't have data for "${userInput}". Try typing "help" to see examples, or try words like 'think', 'run', 'sing', 'dance', 'read', 'write', or 'listen'.`;

    // Update messages state
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      { sender: "assistant", text: assistantResponse }
    ]);

    // Save to database
    if (user) {
      await saveChatToDatabase(userInput, assistantResponse, found ? found.region : []);
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

    setInput("");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 pt-20 lg:pt-24 overflow-hidden">
        <div className="flex flex-col lg:flex-row w-full min-h-0">
          {/* 3D Model Section */}
          <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-4 lg:p-6 min-w-0 min-h-0">
            <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Brain Canvas Container */}
              <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <BrainCanvas highlightedRegions={highlightedRegions} />
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 lg:hidden px-4">
              <p>💡 Try: "think", "run", "sing", "dance", "read", "write", "listen", "cook"</p>
              <p className="mt-1 text-xs text-gray-500">Type "help" for more examples</p>
            </div>






          </main>

          {/* Chat Sidebar */}
          <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shadow-lg">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 lg:p-6 border-b bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Brain Assistant</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Ask me about any action!</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0 max-h-[300px] lg:max-h-none">
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
            <form className="p-3 sm:p-4 lg:p-6 border-t bg-gray-50" onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Type any action: think, run, sing, cook, read..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-xs sm:text-sm lg:text-base transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-white w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full font-bold hover:bg-yellow-500 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-xl lg:text-2xl hover:scale-105 active:scale-95"
                  disabled={!input.trim()}
                >
                  →
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