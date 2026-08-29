import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, CheckCircle2, Lock, X } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';

export const EmailVerificationModal: React.FC = () => {
  const { pendingEmailDispatch, setPendingEmailDispatch, verifyEmailAndSetPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<'VIEW_EMAIL' | 'SET_PASSWORD'>('VIEW_EMAIL');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pendingEmailDispatch) return null;

  const isReset = pendingEmailDispatch.type === 'RESET_PASSWORD';

  const handleAuthorizeLinkClick = () => {
    playCyberClick();
    setStep('SET_PASSWORD');
    setFullName(pendingEmailDispatch.name || pendingEmailDispatch.toEmail.split('@')[0]);
    setCallsign(pendingEmailDispatch.callsign || pendingEmailDispatch.toEmail.split('@')[0].toUpperCase());
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');

    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (isReset) {
        const success = resetPassword(pendingEmailDispatch.toEmail, password);
        if (success) {
          playSuccessChime();
        } else {
          setErrorMsg('Failed to reset password.');
        }
      } else {
        const success = verifyEmailAndSetPassword(pendingEmailDispatch.toEmail, password, {
          fullName: fullName || pendingEmailDispatch.toEmail.split('@')[0],
          callsign: (callsign || pendingEmailDispatch.toEmail.split('@')[0]).toUpperCase(),
        });
        if (success) {
          playSuccessChime();
        } else {
          setErrorMsg('Failed to complete verification.');
        }
      }
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPendingEmailDispatch(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative z-10 w-full max-w-md bg-[#09090b] border border-zinc-700 p-6 shadow-2xl text-zinc-100 font-mono text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-white uppercase">
              <Mail size={15} className="text-purple-400" />
              <span>{isReset ? 'PASSWORD RESET' : 'EMAIL VERIFICATION'}</span>
            </div>
            <button
              onClick={() => {
                playCyberClick();
                setPendingEmailDispatch(null);
              }}
              className="p-1 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-500 bg-zinc-900 transition-colors"