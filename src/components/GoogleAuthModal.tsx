import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'login'
}) => {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setCompany('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('একটি সঠিক ইমেইল অ্যাড্রেস প্রদান করুন (Valid Email is required)');
      return;
    }

    if (!password) {
      setError('অনুগ্রহ করে আপনার পাসওয়ার্ড প্রদান করুন');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('আপনার পুরো নাম প্রদান করুন (Full Name is required)');
        return;
      }
      if (!phone.trim()) {
        setError('আপনার সচল হোয়াটসঅ্যাপ বা মোবাইল নম্বর প্রদান করুন');
        return;
      }
      if (password.length < 4) {
        setError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
        return;
      }
      if (password !== confirmPassword) {
        setError('পাসওয়ার্ড দুটি মেলেনি! নিশ্চিতকরণ পাসওয়ার্ড পুনরায় চেক করুন');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(cleanEmail, password);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        await register(name.trim(), cleanEmail, phone.trim(), password, company.trim() || undefined);
        setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 500);
      }
    } catch (err: any) {
      const rawMsg = err?.message || '';
      if (rawMsg.includes('is not valid JSON') || rawMsg.includes('Unexpected token') || rawMsg.includes('The page c')) {
        setError('সার্ভারের সাথে সংযোগ স্থাপন করা হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।');
      } else {
        setError(rawMsg || 'অনুরোধটি প্রক্রিয়া করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#0D0D0D] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 mb-3 shadow-lg shadow-rose-600/30">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {mode === 'login' ? 'সাইন ইন / লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {mode === 'login' 
                ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্টে প্রবেশ করুন' 
                : 'অর্ডার এবং সার্ভিস এক্সেস পেতে আপনার তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#151515] p-1 border border-neutral-800 mb-6">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>সাইন ইন (Sign In)</span>
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>সাইন আপ (Sign Up)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  আপনার নাম (Full Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  placeholder="আপনার সম্পূর্ণ নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                ইমেইল অ্যাড্রেস (Email Address) <span className="text-rose-500">*</span>
              </label>
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  মোবাইল / হোয়াটসঅ্যাপ নম্বর (WhatsApp/Phone) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="auth-phone-input"
                  type="tel"
                  required
                  placeholder="01700-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  কোম্পানি / ব্র্যান্ডের নাম <span className="text-neutral-500 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  id="auth-company-input"
                  type="text"
                  placeholder="e.g. My Brand Ltd."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                পাসওয়ার্ড (Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={mode === 'register' ? 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' : 'আপনার পাসওয়ার্ড লিখুন'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-xs transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'লগইন করুন (Sign In)' : 'অ্যাকাউন্ট তৈরি করুন (Create Account)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch Prompt */}
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-neutral-400">
                অ্যাকাউন্ট নেই?{' '}
                <button
                  id="switch-to-signup-btn"
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </button>
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  id="switch-to-signin-btn"
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  সাইন ইন করুন
                </button>
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-center text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-rose-500" />
              Secure 256-Bit Encrypted Authentication
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
