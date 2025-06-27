'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';

// Auth Page Component
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

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
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1000);
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
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Account created successfully! You can now log in.');
        setIsLogin(true);
        setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
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
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="BaldSphere Logo"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BaldSphere</h2>
            <p className="text-gray-600">Explore your brain with interactive 3D visualization</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              {success}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h3>

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
                <div className="text-2xl mb-2">
                  <Image src="/brain.svg" alt="Brain" width={32} height={32} className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-700">Interactive 3D Brain</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  <Image src="/arrow.svg" alt="Arrows" width={32} height={32} className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-700">Brain Region Arrows</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  <Image src="/chat-icon.svg" alt="Chat" width={32} height={32} className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-700">AI Brain Chat</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  <Image src="/track.svg" alt="Tracking" width={32} height={32} className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-700">Activity Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  }, []);

  useEffect(() => {
    // Redirect to /home if user is authenticated
    if (user && !loading) {
      window.location.href = '/home';
    }
  }, [user, loading]);

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

  // Only show auth page if user is not authenticated
  return <AuthPage />;
}

