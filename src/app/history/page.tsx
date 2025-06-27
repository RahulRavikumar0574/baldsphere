"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChatSession,
  loadChatSessions,
  deleteChatSession,
  clearAllChatSessions
} from "@/utils/chatStorage";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    try {
      const sessions = loadChatSessions();
      setSessions(sessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    loadSessions(); // Reload sessions from storage

    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const clearAllSessions = () => {
    clearAllChatSessions();
    setSessions([]);
    setSelectedSession(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSessionPreview = (session: ChatSession) => {
    const firstUserMessage = session.messages.find(msg => msg.sender === "user");
    return firstUserMessage ? firstUserMessage.text : "No messages";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 lg:pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="pt-28 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Chat History</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Review your past conversations with BaldSphere. All your brain exploration sessions are saved here for easy access.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={clearAllSessions}
              disabled={sessions.length === 0}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Clear All History
            </button>
          </div>

          {/* Content */}
          {sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <div className="text-6xl">🧠</div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Chat History Yet</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Start a conversation with BaldSphere to see your chat history here.
                All your brain exploration sessions will be saved automatically and you can revisit them anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/chat"
                  className="inline-flex items-center justify-center bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Image src="/chat-icon.svg" alt="Chat" width={20} height={20} className="w-5 h-5 mr-2" />
                  Start Your First Chat
                </a>
                <a
                  href="/how-it-works"
                  className="inline-flex items-center justify-center bg-white text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  <span className="mr-2">📚</span>
                  Learn How It Works
                </a>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sessions List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      
                      Chat Sessions
                    </h2>
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      {sessions.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative bg-gradient-to-r rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                          selectedSession?.id === session.id
                            ? "border-yellow-400 from-yellow-50 to-yellow-100 shadow-md"
                            : "border-gray-200 from-white to-gray-50 hover:border-yellow-300 hover:from-yellow-50 hover:to-yellow-100"
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 truncate flex-1 text-sm">
                            {session.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 ml-2 text-sm transition-opacity p-1 hover:bg-red-50 rounded"
                            title="Delete session"
                          >
                            🗑️
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-3 leading-relaxed">
                          "{getSessionPreview(session)}"
                        </p>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-3 text-gray-500">
                            <span className="flex items-center">
                              <Image src="/chat-icon.svg" alt="Chat" width={12} height={12} className="w-3 h-3 mr-1" />
                              {session.messages.length}
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">🕒</span>
                              {formatDate(session.lastUpdated).split(' ')[0]}
                            </span>
                          </div>
                          {selectedSession?.id === session.id && (
                            <span className="text-yellow-600 font-medium">Selected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Session Detail */}
              <div className="lg:col-span-2">
                {selectedSession ? (
                  <div className="bg-white rounded-xl shadow-lg h-[700px] flex flex-col overflow-hidden">
                    {/* Session Header */}
                    <div className="p-6 bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            
                            {selectedSession.name}
                          </h2>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="mr-1">📅</span>
                              Created: {formatDate(selectedSession.createdAt)}
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">🔄</span>
                              Updated: {formatDate(selectedSession.lastUpdated)}
                            </span>
                            <span className="flex items-center">
                              <Image src="/chat-icon.svg" alt="Chat" width={12} height={12} className="w-3 h-3 mr-1" />
                              {selectedSession.messages.length} messages
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSession(null)}
                          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                      <div className="space-y-4">
                        {selectedSession.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-md text-sm px-5 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                                message.sender === "user"
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium"
                                  : "bg-white text-gray-800 border border-gray-200"
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <span className="text-xs opacity-75">
                                  {message.sender === "user" ? "👤" : "🤖"}
                                </span>
                                <div className="flex-1">
                                  {message.text}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                          href="/chat"
                          className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 text-sm font-semibold shadow-lg min-w-[200px]"
                        >
                          
                          Continue in New Chat
                        </a>
                        <button
                          onClick={() => deleteSession(selectedSession.id)}
                          className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 text-sm font-semibold shadow-lg min-w-[200px]"
                        >
                          <span className="mr-2"></span>
                          Delete Session
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg h-[700px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <span className="text-4xl">💭</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Chat Session</h3>
                      <p className="text-gray-500">Choose a session from the left to view the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
