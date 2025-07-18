import { useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { TrendingUp, ArrowRight, Shield, Zap, Brain, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isLogin) {
        // Sign in existing user
        await authService.signInWithEmail(email, password);
      } else {
        // Sign up new user
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!fullName.trim()) {
          throw new Error('Full name is required');
        }
        
        await authService.signUpWithEmail(email, password, fullName.trim());
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setIsLogin(true);
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1000ms'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Logo and Title - Show in both modes */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl animate-float">
            <TrendingUp size={28} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            BillBox
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300">Your Smart Financial Companion</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Create your account to start tracking'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 text-xs sm:text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Full Name (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm sm:text-base"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm sm:text-base"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm sm:text-base"
                    required={!isLogin}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}