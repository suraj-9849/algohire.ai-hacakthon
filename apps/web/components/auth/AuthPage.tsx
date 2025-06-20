'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Shield, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/components/providers/AuthProvider'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, signUp } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with end-to-end encryption'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless collaboration tools for hiring teams'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick candidate processing and instant notifications'
    }
  ]

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-black rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-3xl font-bold text-black">AlgoHire</h1>
            <p className="text-gray-600 mt-2">Professional Candidate Management</p>
          </motion.div>

          {/* Form Card */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-black">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {isLogin
                  ? 'Sign in to your account to continue'
                  : 'Join thousands of professionals'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-800 text-white h-11"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-black hover:text-gray-700 p-0 h-auto font-semibold"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm text-gray-500 mb-4">Trusted by 10,000+ professionals</p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span className="text-xs">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs">SOC 2 Certified</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 bg-gray-50 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Streamline Your Hiring Process
            </h2>
            <p className="text-xl text-gray-600">
              Manage candidates, track progress, and collaborate with your team all in one place.
            </p>
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 