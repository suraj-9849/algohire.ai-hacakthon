'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Users, 
  MessageSquare, 
  Bell, 
  Shield, 
  Zap, 
  CheckCircle,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isAuthMode, setIsAuthMode] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleAuthClick = () => {
    setIsAuthMode(true)
  }

  const features = [
    {
      icon: Users,
      title: 'Collaborative Hiring',
      description: 'Work together with your team to evaluate and discuss candidates in real-time.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Notes',
      description: 'Share instant feedback and notes with @mentions and live updates.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get notified when you\'re mentioned or when important updates happen.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security to protect your sensitive hiring data.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Head of Talent',
      company: 'TechCorp',
      quote: 'AlgoHire transformed our hiring process. Real-time collaboration reduced our time-to-hire by 40%.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Manager',
      company: 'StartupXYZ',
      quote: 'The @mention feature keeps everyone in the loop. No more missed feedback or delayed decisions.',
      rating: 5
    }
  ]

  // Show auth page if auth mode is triggered
  if (isAuthMode) {
    const AuthPage = require('@/components/auth/AuthPage').AuthPage
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">AlgoHire</h1>
                <p className="text-sm text-gray-600">Collaborative Candidate Notes</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleAuthClick}
                className="border-gray-300 hover:bg-gray-50"
              >
                Login
              </Button>
              <Button
                onClick={handleAuthClick}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              Revolutionize Your
              <br />
              <span className="text-gray-600">Hiring Process</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Collaborate in real-time, share instant feedback, and make faster hiring decisions 
              with our collaborative candidate notes platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleAuthClick}
                className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAuthClick}
                className="border-gray-300 hover:bg-gray-50 text-lg px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              Everything You Need to Hire Better
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern recruiting teams
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about AlgoHire
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-black fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-black">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of companies already using AlgoHire to make better hiring decisions.
            </p>
            <Button
              size="lg"
              onClick={handleAuthClick}
              className="bg-white hover:bg-gray-100 text-black text-lg px-8 py-3"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-semibold text-black">AlgoHire</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 AlgoHire. Built for the hiring hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
