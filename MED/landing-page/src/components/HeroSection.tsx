'use client'

import { motion } from 'framer-motion'
import { PillBottle, Heart, Shield, Smartphone, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from './Logo'

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20 py-6 px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto flex justify-center items-center"
    >
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Logo />
      </motion.div>
    </motion.div>
  </header>
);

export default function HeroSection() {
  return (
    <>
      <Header />
      <section className="relative section-padding min-h-screen flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="floating-orb w-96 h-96 bg-purple-600 top-10 left-10" style={{ animationDelay: '0s' }} />
        <div className="floating-orb w-80 h-80 bg-teal-500 bottom-10 right-10" style={{ animationDelay: '2s' }} />
        <div className="floating-orb w-64 h-64 bg-purple-800 top-1/2 left-1/4" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center glass-card rounded-full px-6 py-3 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Health Companion</span>
            </motion.div>

            <h1 className="text-6xl font-bold">
              Never Miss Your Medication{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Again</span>
                <motion.svg
                  viewBox="10 0 40 20"
                  className="absolute -bottom-4 right-0 w-32 h-10 pointer-events-none"
                  style={{ rotate: -7 }}
                >
                  <motion.path
                    d="M5 15 Q 60 5 115 15 C 90 30 40 30 10 22"
                    fill="none"
                    stroke="#ff4500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 1.3, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M10 18 Q 55 12 100 19"
                    fill="none"
                    stroke="#ff4500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 1.4, ease: "easeInOut" }}
                  />
                </motion.svg>
              </span>
            </h1>

            <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
              <span className="font-bold bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">PillPal</span> is a user-friendly medication tracking app designed especially for seniors.
              Get smart reminders, AI-powered health tips, and peace of mind for you and your loved ones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  asChild
                  variant="glass"
                  size="xl"
                  className="glass-button-primary w-full sm:w-auto text-center justify-center"
                  data-testid="button-get-started"
                >
                  <a href="https://pillpal-app.ankanroy.in" className="flex items-center justify-center">
                    <PillBottle className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Start Tracking</span>
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  variant="glass"
                  size="xl"
                  className="glass-button w-full sm:w-auto justify-center"
                  onClick={() => document.getElementById('features')?.scrollIntoView()}
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-white/80">
              <div className="flex items-center glass-card px-4 py-2 rounded-full">
                <Shield className="h-4 w-4 mr-2 text-green-300 flex-shrink-0" />
                <span className="whitespace-nowrap">HIPAA Compliant</span>
              </div>
              <div className="flex items-center glass-card px-4 py-2 rounded-full">
                <Heart className="h-4 w-4 mr-2 text-red-300 flex-shrink-0" />
                <span className="whitespace-nowrap">Trusted by 10,000+ Seniors</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="glass-card p-8 mx-auto max-w-md border-white/30">
              <CardContent className="text-center space-y-6 p-0">
                <div className="glass-card rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center border-white/30">
                  <Smartphone className="h-10 w-10 text-cyan-300" />
                </div>

                <h3 className="text-2xl font-bold text-white">
                  Simple & Intuitive
                </h3>

                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4 text-left border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Morning Pills</span>
                      <span className="text-green-300 font-semibold flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        Taken
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">8:00 AM - Metformin, Lisinopril</p>
                  </div>

                  <div className="glass-card rounded-lg p-4 text-left border-yellow-300/30 bg-yellow-400/10">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Afternoon Pills</span>
                      <span className="text-yellow-300 font-semibold flex items-center">
                        <PillBottle className="h-4 w-4 mr-1" />
                        Due Soon
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">2:00 PM - Vitamin D</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating elements with glass effect */}
            <motion.div
              className="absolute -top-4 -right-4 glass-card text-white rounded-full p-3 shadow-lg border-green-300/30"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="h-6 w-6 text-green-300" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 glass-card text-white rounded-full p-3 shadow-lg border-blue-300/30"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <PillBottle className="h-6 w-6 text-blue-300" />
            </motion.div>

            <motion.div
              className="absolute top-1/2 -right-8 glass-card text-white rounded-full p-2 shadow-lg border-purple-300/30"
              animate={{ x: [0, 5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            >
              <Sparkles className="h-4 w-4 text-purple-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}