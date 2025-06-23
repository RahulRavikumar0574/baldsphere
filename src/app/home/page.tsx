'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import HomeBrainModel from '@/components/HomeBrainModel';
import ParticleDesign from '@/components/ParticleDesign';
// Authenticated Navbar
function AuthenticatedNavbar({ user }: { user: any }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
  };

  return (
    <nav className="fixed top-3 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] lg:w-[90vw] max-w-6xl bg-white/10 rounded-xl lg:rounded-2xl shadow-lg px-4 lg:px-12 py-3 lg:py-4 flex items-center justify-between lg:gap-8 backdrop-blur border border-gray-200">
      
      <div className="flex items-center gap-2">
        <a href="/home">
          <Image
            src="/logo.svg"
            alt="BaldSphere Logo"
            width={32}
            height={32}
            className="w-6 h-6 lg:w-8 lg:h-8 rounded-full"
          />
        </a>
        <span className="text-lg lg:text-2xl font-bold text-yellow-500">BaldSphere</span>
      </div>

      <div className="hidden md:flex gap-3 lg:gap-6">
        <a href="/home" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Home</a>
        <a href="/chat" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Chat</a>
        <a href="/how-it-works" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">How It Works</a>
        <a href="/history" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">History</a>
        <a href="/contact" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Contact</a>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 lg:px-4 py-2 rounded-full border border-yellow-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-700 text-sm lg:text-base font-medium">
            Hi, <span className="text-yellow-700 font-semibold">{user.name}</span>!
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-full hover:shadow-lg transition-all duration-200 text-xs lg:text-sm font-medium flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-3 h-3 lg:w-4 lg:h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

// Home Page Component
function HomePage({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 z-50">
      <AuthenticatedNavbar user={user} />
        
      <main className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-6xl mx-auto text-center">
            
          <div className="mb-6 sm:mb-8">
            
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg z-10 ">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                <ParticleDesign />
              </div>
              <p className="text-yellow-800">
                <span className="font-semibold">Welcome back, {user.name}!</span>
                <span className="ml-2">Ready to explore your brain? 🧠</span>
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Explore Your <span className="text-yellow-500">Brain</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8">
              Discover which brain regions control your actions and thoughts.
              Type any activity and see it visualized in an interactive 3D brain model.
            </p>

            <div className="mb-8 sm:mb-12">
              <HomeBrainModel />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <a
              href="/chat"
              className="bg-yellow-400 text-black px-6 sm:px-8 py-4 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-yellow-500 active:bg-yellow-600 transition-colors shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              role="button"
              aria-label="Start exploring brain activities"
            >
              Start Exploring →
            </a>
            <a
              href="/how-it-works"
              className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-4 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:border-yellow-400 hover:text-yellow-600 active:border-yellow-500 active:text-yellow-700 transition-colors touch-manipulation min-h-[48px] flex items-center justify-center"
              role="button"
              aria-label="Learn how BaldSphere works"
            >
              How It Works
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <a
              href="/chat"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg active:shadow-xl transition-shadow touch-manipulation min-h-[100px] flex flex-col items-center justify-center text-center"
              role="button"
              aria-label="Go to Brain Chat"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Brain Chat</h3>
              <p className="text-xs sm:text-sm text-gray-600">Interactive AI conversations</p>
            </a>
            <a
              href="/history"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg active:shadow-xl transition-shadow touch-manipulation min-h-[100px] flex flex-col items-center justify-center text-center"
              role="button"
              aria-label="View chat history"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">History</h3>
              <p className="text-xs sm:text-sm text-gray-600">Your chat sessions</p>
            </a>
            <a
              href="/how-it-works"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg active:shadow-xl transition-shadow touch-manipulation min-h-[100px] flex flex-col items-center justify-center text-center"
              role="button"
              aria-label="Learn how it works"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Learn</h3>
              <p className="text-xs sm:text-sm text-gray-600">How your brain works</p>
            </a>
            <a
              href="/contact"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg active:shadow-xl transition-shadow touch-manipulation min-h-[100px] flex flex-col items-center justify-center text-center"
              role="button"
              aria-label="Contact us"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Contact</h3>
              <p className="text-xs sm:text-sm text-gray-600">Get in touch</p>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main Component
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (userData && isLoggedIn === 'true') {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [0]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BaldSphere...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return <HomePage user={user} />;
}
