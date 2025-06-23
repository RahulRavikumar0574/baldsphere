'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import HomeBrainModel from '@/components/HomeBrainModel';
import ParticleDesign from '@/components/ParticleDesign';

// Auth Page Component
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        window.location.reload();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        window.location.reload();
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="BaldSphere Logo"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome to BaldSphere' : 'Join BaldSphere'}
          </h1>
          <p className="text-lg text-gray-600">
            {isLogin ? 'Sign in to explore your brain' : 'Create your account to get started'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold py-3 px-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In to BaldSphere'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold py-3 px-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create BaldSphere Account'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={switchMode}
                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
              >
                {isLogin ? 'Create one here' : 'Sign in here'}
              </button>
            </p>
          </div>
         
        </div>
        <div className="mt-8 bg-white/50 backdrop-blur rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">What you'll explore:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🧠</div>
              <p className="text-gray-700">Interactive 3D Brain</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏹</div>
              <p className="text-gray-700">Brain Region Arrows</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-gray-700">AI Brain Chat</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-gray-700">Activity Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <a href="/">
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
        <a href="/" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Home</a>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthenticatedNavbar user={user} />

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
              className="bg-yellow-400 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-yellow-500 transition-colors shadow-lg"
            >
              Start Exploring →
            </a>
            <a
              href="/how-it-works"
              className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:border-yellow-400 hover:text-yellow-600 transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <a href="/chat" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Brain Chat</h3>
              <p className="text-sm text-gray-600">Interactive AI conversations</p>
            </a>
            <a href="/history" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">History</h3>
              <p className="text-sm text-gray-600">Your chat sessions</p>
            </a>
            <a href="/how-it-works" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn</h3>
              <p className="text-sm text-gray-600">How your brain works</p>
            </a>
            <a href="/contact" className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-sm text-gray-600">Get in touch</p>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// // Main Component
// export default function Home() {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     const isLoggedIn = localStorage.getItem('isLoggedIn');

//     if (userData && isLoggedIn === 'true') {
//       setUser(JSON.parse(userData));
//     }
//     setLoading(false);
//   }, []);
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading BaldSphere...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <AuthPage />;
//   }

//   return <HomePage user={user} />;
// }

