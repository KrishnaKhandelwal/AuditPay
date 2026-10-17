'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Building, User, ArrowRight, ShieldCheck, Zap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalReason, closeAuthModal, login, signup } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSwitchToSignup, setShowSwitchToSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleTabChange = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    setError('');
    setSuccessMsg('');
    setShowSwitchToSignup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setShowSwitchToSignup(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid business email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please enter a password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        const result = await login(cleanEmail, password);
        if (!result.success) {
          setError(result.error || 'Failed to sign in.');
          if (
            result.error?.toLowerCase().includes('does not exist') ||
            result.error?.toLowerCase().includes('invalid login credentials') ||
            result.error?.toLowerCase().includes('sign up first')
          ) {
            setShowSwitchToSignup(true);
          }
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        const result = await signup(name, cleanEmail, brandName || 'My D2C Brand', password);
        if (!result.success) {
          setError(result.error || 'Failed to create account.');
        } else {
          // First-time user registered successfully! Direct them to sign in with their credentials
          setSuccessMsg('Account created successfully in cloud! Please sign in with your credentials.');
          setPassword('');
          setTab('signin');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto transition-all mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              {tab === 'signin' ? 'Sign in to AuditPay' : 'Create Merchant Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recover silent margin leakages from quick-commerce
            </p>
          </div>
        </div>

        {/* Reason banner if triggered via paywall */}
        {authModalReason && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{authModalReason}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {showSwitchToSignup && (
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError('');
                  setShowSwitchToSignup(false);
                }}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>Create New Account with {email}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand / Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Urban Botanics"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{tab === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{tab === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>



        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4">
          By continuing, you agree to our terms of service and confidential in-memory data processing.
        </p>
      </div>
    </div>
  );
};
