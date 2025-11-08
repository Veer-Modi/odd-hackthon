'use client';

/**
 * WorkZen HRMS - Modern Corporate Login Page
 * 
 * DEFAULT CREDENTIALS:
 * 
 * ADMIN:
 * Email: adminworkzen@gmail.com
 * Password: admin@1234
 * 
 * HR MANAGER:
 * Email: hrworkzen@gmail.com
 * Password: hr@1234
 * 
 * PAYROLL OFFICER:
 * Email: payrollworkzen@gmail.com
 * Password: payroll@1234
 * 
 * EMPLOYEE:
 * Email: employeeworkzen@gmail.com
 * Password: employee@1234
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, LogIn, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, 
  CheckCircle, AlertCircle, Sparkles, Shield, Zap, TrendingUp,
  Users, Briefcase, Award, Rocket, Star, Target, Globe
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials: any = {
      admin: { email: 'adminworkzen@gmail.com', password: 'admin@1234' },
      hr: { email: 'hrworkzen@gmail.com', password: 'hr@1234' },
      payroll: { email: 'payrollworkzen@gmail.com', password: 'payroll@1234' },
      employee: { email: 'employeeworkzen@gmail.com', password: 'employee@1234' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  // Floating emoji stickers
  const floatingStickers = [
    { emoji: '🚀', delay: 0, x: '10%', y: '15%' },
    { emoji: '💼', delay: 0.2, x: '85%', y: '20%' },
    { emoji: '⭐', delay: 0.4, x: '15%', y: '75%' },
    { emoji: '🎯', delay: 0.6, x: '80%', y: '70%' },
    { emoji: '✨', delay: 0.8, x: '5%', y: '45%' },
    { emoji: '🏆', delay: 1, x: '90%', y: '50%' },
    { emoji: '💡', delay: 1.2, x: '12%', y: '30%' },
    { emoji: '🌟', delay: 1.4, x: '88%', y: '35%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 flex items-center justify-center px-4 relative overflow-hidden">
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

      <div className="max-w-7xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Enhanced Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block text-white"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex items-center space-x-4 mb-8"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-5 rounded-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                <Building2 className="h-14 w-14 relative z-10" />
                <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WorkZen
                </h1>
                <p className="text-indigo-200 text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Enterprise HRMS Platform
                </p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-6xl font-black mb-6 leading-tight"
            >
              Transform Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Workforce Management
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-blue-100 mb-10 leading-relaxed font-medium"
            >
              Enterprise-grade HR management with intelligent automation, 
              real-time analytics, and seamless integration. 🚀
            </motion.p>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {[
                { icon: Users, text: 'Team Management', emoji: '👥', color: 'from-blue-500 to-cyan-500' },
                { icon: Briefcase, text: 'HR Solutions', emoji: '💼', color: 'from-purple-500 to-pink-500' },
                { icon: TrendingUp, text: 'Analytics', emoji: '📊', color: 'from-green-500 to-emerald-500' },
                { icon: Award, text: 'Excellence', emoji: '🏆', color: 'from-yellow-500 to-orange-500' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-br ${feature.color} p-2 rounded-xl`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{feature.text}</p>
                      <span className="text-2xl">{feature.emoji}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-6 flex-wrap"
            >
              <div className="flex items-center gap-2 text-blue-200">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">ISO Certified</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">99.9% Uptime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-dark backdrop-blur-2xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                {/* Back Button */}
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">Back to Home</span>
                </motion.button>

                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="lg:hidden flex justify-center mb-4"
                  >
                    <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-4 rounded-3xl shadow-2xl relative">
                      <Building2 className="h-12 w-12 text-white relative z-10" />
                      <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    </div>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-white mb-3 drop-shadow-lg flex items-center justify-center gap-3"
                  >
                    Welcome Back! 👋
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-100 font-semibold text-lg"
                  >
                    Sign in to access your dashboard
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 drop-shadow flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg hover:shadow-xl"
                        placeholder="••••••••"
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
                        <span className="text-sm font-semibold">Login successful! Redirecting... 🎉</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl flex items-center justify-center space-x-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                        <span className="relative z-10">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">Sign In</span>
                      </>
                    )}
                  </motion.button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-blue-200 hover:text-white text-sm transition-colors underline font-semibold"
                    >
                      Forgot Password? 🔑
                    </button>
                  </div>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm mb-2">
                    New company?{' '}
                    <button
                      onClick={() => router.push('/signup')}
                      className="text-blue-300 hover:text-blue-200 font-bold underline transition-colors"
                    >
                      Sign Up Here 🚀
                    </button>
                  </p>
                </div>

                {/* Quick Login */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-white font-bold text-center mb-4 drop-shadow flex items-center justify-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Quick Login (Demo)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { role: 'admin', label: 'Admin', gradient: 'from-red-500 to-red-600', emoji: '👑' },
                      { role: 'hr', label: 'HR Manager', gradient: 'from-blue-500 to-blue-600', emoji: '👔' },
                      { role: 'payroll', label: 'Payroll', gradient: 'from-green-500 to-green-600', emoji: '💰' },
                      { role: 'employee', label: 'Employee', gradient: 'from-purple-500 to-purple-600', emoji: '👤' },
                    ].map((item) => (
                      <motion.button
                        key={item.role}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => quickLogin(item.role)}
                        className={`bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-100 text-center mt-4 font-medium">
                    Click to auto-fill credentials ✨
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
