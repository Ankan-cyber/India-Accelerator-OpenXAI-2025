"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { PillBottle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Invalid credentials")
      }
      // If successful, the AuthProvider will handle the redirect
    } catch (err) {
      console.error('Login error:', err)
      setError("Unable to connect. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="floating-orb w-64 h-64 bg-purple-500/20 -top-32 -left-32" aria-hidden="true"></div>
      <div className="floating-orb w-48 h-48 bg-cyan-500/15 top-1/3 -right-24" style={{ animationDelay: '-2s' }} aria-hidden="true"></div>
      
      <header className="absolute top-0 left-0 w-full p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all">
              <PillBottle className="text-purple-400 h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PillPal</h1>
              <p className="text-sm text-gray-400">Your AI Health Companion</p>
            </div>
          </Link>
        </div>
      </header>

      <section className="w-full max-w-md z-10">
        <div className="glass-card border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-purple-500/20 text-purple-300 rounded-full px-4 py-2 mb-4">
                <span className="font-semibold">Welcome Back</span>
              </div>
              <h2 className="text-4xl font-bold text-white">Sign In</h2>
              <p className="text-gray-400 mt-2">Access your medication dashboard</p>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg text-center">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full glass-button-primary text-lg font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="bg-black/20 px-8 py-4 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-all">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
