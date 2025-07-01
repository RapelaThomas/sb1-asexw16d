import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, ArrowLeft, Banknote } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const RTMoneyMasterLogo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg`}>
    <div className="relative">
      <Banknote className="h-8 w-8 text-white" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
    </div>
  </div>
);

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowPasswordReset(false);
    setResetSent(false);
    setResetEmail('');
    setError(null);
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <button
              onClick={resetForm}
              className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center mb-4">
              <RTMoneyMasterLogo />
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RT MoneyMaster
                </h1>
                <p className="text-sm text-gray-500">Reset Password</p>
              </div>
            </div>
            <p className="text-gray-600">
              {resetSent 
                ? 'Check your email for password reset instructions'
                : 'Enter your email address to receive password reset instructions'
              }
            </p>
          </div>

          {resetSent ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600 mb-2" />
                </div>
                <p className="text-green-800 font-medium">Password reset email sent!</p>
                <p className="text-green-700 text-sm mt-1">
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Reset Email...
                  </div>
                ) : (
                  'Send Reset Email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <RTMoneyMasterLogo />
            <div className="ml-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RT MoneyMaster
              </h1>
              <p className="text-sm text-gray-500">Smart Financial Management</p>
            </div>
          </div>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to start managing your finances' : 'Welcome back! Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              <>
                {isSignUp ? (
                  <>
                    <User className="inline h-5 w-5 mr-2" />
                    Create Account
                  </>
                ) : (
                  <>
                    <Mail className="inline h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        {isSignUp && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Your financial data will be securely stored and encrypted. 
              We never share your personal information with third parties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;