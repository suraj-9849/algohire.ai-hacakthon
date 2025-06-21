'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Users, 
  MessageSquare, 
  Bell, 
  Shield, 
  Zap, 
  CheckCircle,
  Star,
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Award,
  Globe,
  Lock,
  Clock,
  Heart,
  Play,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { HeroScrollDemo } from '@/components/ui/hero-scroll-demo'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isAuthMode, setIsAuthMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAuthClick = () => {
    setIsAuthMode(true)
  }

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time collaboration with sub-second updates and seamless synchronization across all devices.',
      gradient: 'from-gray-900 to-black'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your hiring team, share insights, and make decisions faster.',
      gradient: 'from-gray-800 to-gray-900'
    },
    {
      icon: MessageSquare,
      title: 'Smart Annotations',
      description: 'Rich text editing, @mentions, and intelligent tagging for better candidate evaluation.',
      gradient: 'from-black to-gray-800'
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Never miss important updates with real-time notifications and smart alerts.',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      icon: Target,
      title: 'AI-Powered Insights',
      description: 'Get intelligent notes summariser to optimize your hiring process.',
      gradient: 'from-gray-600 to-gray-800'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Engineering',
      company: 'TechFlow',
      avatar: 'SC',
      quote: 'AlgoHire revolutionized our hiring process. We reduced time-to-hire by 60% and improved candidate quality significantly.',
      rating: 5,
      color: 'from-gray-800 to-black'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Talent',
      company: 'InnovateLabs',
      avatar: 'MR',
      quote: 'The real-time collaboration features are game-changing. Our distributed team finally feels connected during interviews.',
      rating: 5,
      color: 'from-gray-700 to-gray-900'
    },
    {
      name: 'Emily Johnson',
      role: 'CEO',
      company: 'StartupX',
      avatar: 'EJ',
      quote: 'Best hiring tool we\'ve ever used. The AI insights help us make better decisions and avoid costly hiring mistakes.',
      rating: 5,
      color: 'from-black to-gray-800'
    }
  ]


  // Show auth page if auth mode is triggered
  if (isAuthMode) {
    const AuthPage = require('@/components/auth/AuthPage').AuthPage
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_80%,rgba(0,0,0,0.05),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_60%,rgba(0,0,0,0.08),rgba(255,255,255,0))]"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-black/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 
            ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-lg' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">
                  AlgoHire Notes
                </h1>
                <p className="text-sm text-gray-600">The Future of Hiring</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleAuthClick}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleAuthClick}
                  className="bg-black hover:bg-gray-800 text-white border-0 shadow-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200"
            >
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-gray-700 hover:text-black transition-colors">Features</a>
                <a href="#testimonials" className="block text-gray-700 hover:text-black transition-colors">Reviews</a>
                <a href="#pricing" className="block text-gray-700 hover:text-black transition-colors">Pricing</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleAuthClick}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleAuthClick}
                    className="bg-black hover:bg-gray-800 text-white border-0"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section with Enhanced Animations */}
      <section className="relative z-20 pt-24 pb-12 bg-white overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-50"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-black/5 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-48 h-48 bg-gray-900/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-24 h-24 bg-black/8 rounded-full blur-2xl"
            animate={{
              x: [0, -60, 0],
              y: [0, -40, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-6"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-black/10 text-black text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Revolutionizing Hiring with AI
              </motion.span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            >
              <span className="text-black">Transform Your</span>
              <br />
              <motion.span 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-black to-gray-700"
              >
                Hiring Process
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              Real-time collaboration, intelligent candidate management, and seamless team coordination 
              <br className="hidden md:block" />
              all in one powerful platform
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  onClick={handleAuthClick}
                  className="bg-black hover:bg-gray-800 text-white text-lg px-12 py-6 h-auto font-semibold shadow-2xl border-0 group"
                >
                  <Rocket className="mr-3 h-5 w-5 group-hover:animate-pulse" />
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAuthClick}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white text-lg px-12 py-6 h-auto font-semibold hover:border-black transition-all duration-300 group"
                >
                  <Play className="mr-3 h-5 w-5 group-hover:animate-pulse" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

          </div>
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.8 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-black/30 to-gray-900/20 rounded-3xl  scale-105 opacity-30"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <motion.img
                src="/dashboard.png"
                alt="AlgoHire Dashboard"
                className="w-full h-auto p-4 object-cover"
                initial={{ scale: 1 }}
                transition={{ duration: 1.5, delay: 2 }}
                whileHover={{ scale: 1.02 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-black">
                Supercharge Your
              </span>
              <br />
              <span className="text-gray-700">
                Hiring Process
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge features designed to revolutionize how modern teams hire top talent
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group"
              >
                <Card className="bg-white/80 backdrop-blur-xl border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-500`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-20 py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 border border-gray-200 shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-black">
                Ready to Transform
              </span>
              <br />
              <span className="text-gray-700">
                Your Hiring?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time collaboration, intelligent candidate management, and seamless team coordination
            all in one powerful platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={handleAuthClick}
                  className="bg-black hover:bg-gray-800 text-white text-lg px-12 py-4 h-auto font-semibold shadow-2xl border-0"
                >
                  <Rocket className="mr-3 h-5 w-5" />
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAuthClick}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white text-lg px-12 py-4 h-auto font-semibold"
                >
                  <Heart className="mr-3 h-5 w-5" />
                  Book Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <footer className="relative z-20 py-12 px-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">AlgoHire</h3>
                <p className="text-sm text-gray-600">The Future of Hiring</p>
              </div>
            </div>
            <div className="flex space-x-8 text-gray-600">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2025 AlgoHire.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
