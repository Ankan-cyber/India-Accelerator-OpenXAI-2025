'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Star, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="floating-orb w-96 h-96 bg-purple-600 top-20 left-20" style={{animationDelay: '0s'}} />
      <div className="floating-orb w-80 h-80 bg-teal-500 bottom-20 right-20" style={{animationDelay: '2s'}} />
      <div className="floating-orb w-64 h-64 bg-purple-800 top-1/2 left-1/3" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-card border-white/30 p-8 md:p-12">
            <CardContent className="space-y-8 p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center">
                  <Clock className="w-12 h-12 text-purple-300" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Dashboard{" "}
                  <span className="bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
                    Coming Soon
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  We're putting the finishing touches on your personalized medication management dashboard. 
                  It will include smart tracking, AI health insights, and family sharing features.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              >
                <div className="glass-card p-6 space-y-3 rounded-lg">
                  <Star className="w-8 h-8 text-purple-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-white">Smart Tracking</h3>
                  <p className="text-white/70 text-sm">Intelligent medication reminders with progress monitoring</p>
                </div>
                
                <div className="glass-card p-6 space-y-3 rounded-lg">
                  <Zap className="w-8 h-8 text-teal-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  <p className="text-white/70 text-sm">Personalized health tips based on your medication profile</p>
                </div>
                
                <div className="glass-card p-6 space-y-3 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-white">Family Sharing</h3>
                  <p className="text-white/70 text-sm">Keep loved ones informed with progress updates</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="pt-8"
              >
                <Link href="/">
                  <Button className="glass-button inline-flex items-center gap-2 px-8 py-3">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}