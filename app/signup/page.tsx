'use client';

/**
 * WorkZen HRMS - Company/Admin Signup Page
 * Corporate-themed signup page for new companies
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UserPlus, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, 
  CheckCircle, AlertCircle, Sparkles, Shield, Briefcase, Globe,
  Phone, Building, User, FileText, Rocket, Star, Target, Award
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          adminName: formData.adminName,
          email: formData.adminEmail,
          phone: formData.adminPhone,
          password: formData.password,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Floating emoji stickers
  const floatingStickers = [
    { emoji: '🎉', delay: 0, x: '8%', y: '12%' },
    { emoji: '🚀', delay: 0.2, x: '88%', y: '18%' },
    { emoji: '⭐', delay: 0.4, x: '12%', y: '78%' },
    { emoji: '💼', delay: 0.6, x: '85%', y: '72%' },
    { emoji: '✨', delay: 0.8, x: '6%', y: '48%' },
    { emoji: '🏢', delay: 1, x: '92%', y: '52%' },
    { emoji: '💡', delay: 1.2, x: '10%', y: '28%' },
    { emoji: '🌟', delay: 1.4, x: '90%', y: '32%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Emoji Stickers */}
      {floatingStickers.map((sticker, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            duration: 4 + idx * 0.5,
            repeat: Infinity,
            delay: sticker.delay,
          }}
          className="absolute text-4xl pointer-events-none"
          style={{ left: sticker.x, top: sticker.y }}
        >
          {sticker.emoji}
        </motion.div>
      ))}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="glass-dark backdrop-blur-2xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Login</span>
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-5 rounded-3xl shadow-2xl relative">
                    <Building2 className="h-14 w-14 text-white relative z-10" />
                    <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    <Rocket className="h-5 w-5 absolute -bottom-1 -left-1 text-yellow-300 animate-bounce" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black text-white mb-3 drop-shadow-lg flex items-center justify-center gap-3"
                >
                  Join WorkZen! 🎉
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-100 font-semibold text-lg"
                >
                  Create your company account and transform your HR management
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name *
                  </label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                      placeholder="Your Company Name"
                      required
                    />
                  </div>
                </motion.div>

                {/* Admin Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Admin Full Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </motion.div>

                {/* Email and Phone Row */}
                <div className="grid md:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Admin Email *
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="admin@company.com"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type="tel"
                        name="adminPhone"
                        value={formData.adminPhone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Password and Confirm Password Row */}
                <div className="grid md:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="Min. 8 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="Re-enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Company Address
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl resize-none"
                      placeholder="Company headquarters address (optional)"
                    />
                  </div>
                </motion.div>

                {/* Error/Success Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="flex items-center space-x-3 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-semibold">{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="flex items-center space-x-3 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-semibold">Account created successfully! Redirecting to login... 🎉</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl flex items-center justify-center space-x-2 relative overflow-hidden group mt-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Create Company Account 🚀</span>
                    </>
                  )}
                </motion.button>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm">
                    Already have an account?{' '}
                    <button
                      onClick={() => router.push('/login')}
                      className="text-blue-300 hover:text-blue-200 font-bold underline transition-colors"
                    >
                      Sign In Here 👋
                    </button>
                  </p>
                </div>

                {/* Benefits Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 pt-6 border-t border-white/20"
                >
                  <p className="text-sm text-white font-bold text-center mb-4 drop-shadow flex items-center justify-center gap-2">
                    <Star className="h-4 w-4" />
                    What You Get
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Shield, text: 'Secure', emoji: '🔒' },
                      { icon: Briefcase, text: 'Professional', emoji: '💼' },
                      { icon: Target, text: 'Efficient', emoji: '🎯' },
                      { icon: Award, text: 'Premium', emoji: '🏆' },
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05, y: -3 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center hover:bg-white/10 transition-all"
                      >
                        <benefit.icon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-white">{benefit.text}</p>
                        <span className="text-xl">{benefit.emoji}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

