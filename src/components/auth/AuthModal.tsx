import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signIn, signUp, sendPasswordReset, resetPassword, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'SET_NEW_PASSWORD'>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cleanly wipe all typed details whenever modal is closed or reopened
  useEffect(() => {
    if (authModalOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setFirstName('');
      setLastName('');
      setUsername('');
      setErrorMsg('');
      setInfoMsg('');
      setIsLoading(false);
    }
  }, [authModalOpen]);

  const handleCloseModal = () => {
    playCyberClick();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setFirstName('');
    setLastName('');
    setUsername('');
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(false);
    setMode('SIGN_IN');
    setAuthModalOpen(false);
  };

  const handleModeSwitch = (newMode: 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'SET_NEW_PASSWORD') => {
    playCyberClick();
    setMode(newMode);
    setErrorMsg('');
    setInfoMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const result = await signIn(cleanEmail, password);
        if (result.success) {
          playSuccessChime();
          handleCloseModal();
        } else if (result.isNewUser) {
          setErrorMsg(result.message || 'No account found. Please click REGISTER above.');
        } else {
          setErrorMsg(result.message || 'Invalid password credentials.');
        }
      } else if (mode === 'SIGN_UP') {
        if (!username.trim()) {
          setErrorMsg('Please enter a unique username handle.');
          setIsLoading(false);
          return;
        }
        if (!firstName.trim() || !lastName.trim()) {
          setErrorMsg('Please enter both your first and last name.');
          setIsLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        const result = await signUp(cleanEmail, firstName, lastName, username, password);
        if (result.success) {
          playSuccessChime();
          handleCloseModal();
        } else {
          setErrorMsg(result.message);
        }
      } else if (mode === 'FORGOT_PASSWORD') {
        const success = await sendPasswordReset(cleanEmail);
        if (success) {
          playSuccessChime();
          setInfoMsg('Password reset instructions dispatched to your email.');
        } else {
          setErrorMsg('Failed to dispatch password reset email. Account not found.');
        }
      } else if (mode === 'SET_NEW_PASSWORD') {
        if (!password || password.length < 6) {
          setErrorMsg('New password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const success = await resetPassword(cleanEmail, password);
        if (success) {
          playSuccessChime();
          setInfoMsg('Password updated successfully! You are now logged in.');
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          setErrorMsg('Failed to update password.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    playCyberClick();
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      await loginWithGoogle();
      playSuccessChime();
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Google Sign-In was cancelled or encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authModalOpen) return null;

  const isStandardAuth = mode === 'SIGN_IN' || mode === 'SIGN_UP';

  const modalContent = (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleCloseModal}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          opacity: 0.92,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 1,
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#0a0a0f',
          background: '#0a0a0f',
          color: '#ffffff',
          width: '100%',
          maxWidth: '26rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          border: '2px solid #a855f7',
          boxShadow: '0 0 80px rgba(0, 0, 0, 1), 0 0 40px rgba(168, 85, 247, 0.25)',
          padding: '1.5rem',
          fontFamily: 'var(--font-mono), monospace',
          userSelect: 'none',
          opacity: 1,
          isolation: 'isolate',
        }}
        className="tech-corner-box modal-scroll-box"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
            {!isStandardAuth && (
              <button
                type="button"
                onClick={() => handleModeSwitch('SIGN_IN')}
                className="text-purple-400 hover:text-white mr-1 transition-colors"
                title="Back to Sign In"
              >
                <ArrowLeft size={15} />
              </button>
            )}
            <span>
              {mode === 'SIGN_IN'
                ? 'MEMBER SIGN IN'
                : mode === 'SIGN_UP'
                ? 'MEMBER REGISTRATION'
                : mode === 'FORGOT_PASSWORD'
                ? 'RESET PASSWORD'
                : 'SET NEW PASSWORD'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-500 bg-zinc-900 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Register) */}
        {isStandardAuth && (
          <div className="grid grid-cols-2 gap-1 mt-4 p-1 bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleModeSwitch('SIGN_IN')}
              className={`py-1.5 font-bold uppercase transition-all ${
                mode === 'SIGN_IN'
                  ? 'bg-white text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('SIGN_UP')}
              className={`py-1.5 font-bold uppercase transition-all ${
                mode === 'SIGN_UP'
                  ? 'bg-white text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* Google 1-Click Auth (Only on Sign-In and Sign-Up) */}
        {isStandardAuth && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer font-mono"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            <div className="flex items-center gap-3 my-3 text-[10px] text-zinc-500 uppercase font-mono">
              <div className="h-[1px] bg-zinc-800 flex-1" />
              <span>OR EMAIL</span>
              <div className="h-[1px] bg-zinc-800 flex-1" />
            </div>
          </div>
        )}

        {/* Forgot Password Subtitle */}
        {mode === 'FORGOT_PASSWORD' && (
          <div className="my-4 text-xs font-mono text-zinc-400">
            Enter your registered email address to receive a secure password reset link.
          </div>
        )}

        {/* Set New Password Subtitle */}
        {mode === 'SET_NEW_PASSWORD' && (
          <div className="my-4 text-xs font-mono text-zinc-400">
            Create a new secure password for <span className="text-white font-bold">{email || 'your account'}</span>.
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
          {mode === 'SIGN_UP' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <User size={11} className="text-purple-400" />
                  <span>USERNAME HANDLE</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">FIRST NAME</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">LAST NAME</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mercer"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Address (Shown on SIGN_IN, SIGN_UP, and FORGOT_PASSWORD) */}
          {mode !== 'SET_NEW_PASSWORD' && (
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Mail size={11} className="text-purple-400" />
                <span>EMAIL ADDRESS</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Password for SIGN_IN and SIGN_UP */}
          {isStandardAuth && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <Lock size={11} className="text-purple-400" />
                  <span>PASSWORD</span>
                </label>
                {mode === 'SIGN_IN' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('FORGOT_PASSWORD')}
                    className="text-[9px] text-purple-400 hover:text-purple-300 underline font-bold"
                  >
                    FORGOT PASSWORD?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-3 pr-10 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* New Password fields for SET_NEW_PASSWORD mode */}
          {mode === 'SET_NEW_PASSWORD' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <KeyRound size={11} className="text-purple-400" />
                  <span>NEW PASSWORD</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full bg-zinc-950 border border-zinc-800 pl-3 pr-10 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <Lock size={11} className="text-purple-400" />
                  <span>CONFIRM NEW PASSWORD</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-950/80 border border-red-700 text-[11px] text-red-200 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 text-[11px] text-emerald-200 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
              {mode === 'FORGOT_PASSWORD' && (
                <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-300">Need to reset right now?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('SET_NEW_PASSWORD')}
                    className="text-white font-bold underline hover:text-emerald-300"
                  >
                    Set New Password Directly →
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>PROCESSING...</span>
              </div>
            ) : mode === 'SIGN_IN' ? (
              <span>SIGN IN</span>
            ) : mode === 'SIGN_UP' ? (
              <span>CREATE ACCOUNT</span>
            ) : mode === 'FORGOT_PASSWORD' ? (
              <span>SEND RESET LINK</span>
            ) : (
              <span>UPDATE PASSWORD & LOGIN</span>
            )}
          </button>

          {!isStandardAuth && (
            <button
              type="button"
              onClick={() => handleModeSwitch('SIGN_IN')}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors mt-2"
            >
              ← RETURN TO SIGN IN
            </button>
          )}
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default AuthModal;
