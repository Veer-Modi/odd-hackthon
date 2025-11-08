'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, Users, Calendar, DollarSign, ArrowRight,
  CheckCircle, TrendingUp, Shield, Zap, BarChart3, Clock
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Premium Navbar */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">WorkZen HRMS</h1>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/signup')}
                className="px-4 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign Up
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Enterprise Grade */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-6 shadow-lg"
              >
                <Zap className="h-4 w-4" />
                <span className="text-sm font-semibold">Enterprise-Grade HRMS</span>
              </motion.div>

              <h2 className="text-7xl font-black mb-6 leading-tight">
                <span className="gradient-text">Transform</span>
                <br />
                <span className="text-slate-900">Your HR Operations</span>
              </h2>
              
              <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Enterprise-grade Human Resource Management System with intelligent automation,
                real-time analytics, and seamless integration. Built for modern organizations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(14, 165, 233, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass px-8 py-4 rounded-xl font-semibold text-slate-700 hover:bg-white/80 transition-all"
                >
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Premium Design */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h3>
            <p className="text-xl text-slate-600">Everything you need to manage your workforce efficiently</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                className="premium-card group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <motion.div
                  className="mt-4 flex items-center text-blue-600 font-semibold"
                  whileHover={{ x: 5 }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Flow */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-5xl font-bold mb-4">Seamless Integration</h3>
            <p className="text-xl text-slate-300">All modules work together perfectly</p>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {['Employee', 'Attendance', 'Leave', 'Payroll', 'Dashboard'].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center"
              >
                <div className="glass-dark px-8 py-4 rounded-xl font-semibold">
                  {step}
                </div>
                {idx < 4 && (
                  <ArrowRight className="h-6 w-6 mx-4 text-blue-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
            <div className="relative">
              <h3 className="text-4xl font-bold mb-4">Ready to Transform Your HR?</h3>
              <p className="text-xl text-slate-600 mb-8">Join thousands of companies using WorkZen HRMS</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="btn-primary text-lg px-10 py-4"
              >
                Start Free Trial
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">WorkZen HRMS</span>
          </div>
          <p className="text-slate-400">© 2024 WorkZen. Built for Enterprise Excellence.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <Users className="h-7 w-7 text-white" />,
    title: 'Employee Management',
    description: 'Complete employee lifecycle management with automated workflows and smart profiles.',
  },
  {
    icon: <Clock className="h-7 w-7 text-white" />,
    title: 'Time & Attendance',
    description: 'Real-time attendance tracking with biometric integration and automated reports.',
  },
  {
    icon: <Calendar className="h-7 w-7 text-white" />,
    title: 'Leave Management',
    description: 'Intelligent leave policies with automated approval workflows and balance tracking.',
  },
  {
    icon: <DollarSign className="h-7 w-7 text-white" />,
    title: 'Payroll System',
    description: 'Automated salary calculations with tax compliance and instant payslip generation.',
  },
  {
    icon: <BarChart3 className="h-7 w-7 text-white" />,
    title: 'Analytics & Reports',
    description: 'Real-time insights with customizable dashboards and predictive analytics.',
  },
  {
    icon: <Shield className="h-7 w-7 text-white" />,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security with role-based access and audit trails.',
  },
  {
    icon: <TrendingUp className="h-7 w-7 text-white" />,
    title: 'Performance Reviews',
    description: 'Continuous performance tracking with 360-degree feedback and goal setting.',
  },
  {
    icon: <CheckCircle className="h-7 w-7 text-white" />,
    title: 'Workflow Automation',
    description: 'Smart automation for repetitive tasks with custom workflow designer.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '10k+', label: 'Active Users' },
  { value: '24/7', label: 'Support Available' },
];
