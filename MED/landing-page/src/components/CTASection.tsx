'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const benefits = [
  'Free to use forever',
  'No credit card required', 
  'Setup in under 2 minutes',
  'Works on all devices'
]

export default function CTASection() {
  return (
    <section className="relative section-padding overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="floating-orb w-80 h-80 bg-purple-600 top-10 left-10" style={{animationDelay: '0s'}} />
        <div className="floating-orb w-64 h-64 bg-teal-600 bottom-20 right-20" style={{animationDelay: '2s'}} />
        <div className="floating-orb w-96 h-96 bg-purple-800 top-1/3 right-1/4" style={{animationDelay: '4s'}} />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="glass-card border-white/30 p-6 sm:p-8 lg:p-12 text-center">
          <CardContent className="space-y-6 sm:space-y-8 p-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center glass-card rounded-full px-6 py-3 border-white/30"
              >
                <Star className="h-4 w-4 mr-2 text-yellow-300" />
                <span className="text-white font-medium">Join Our Community</span>
              </motion.div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Ready to Take Control of Your{" "}
                <span className="bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
                  Health?
                </span>
              </h2>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of seniors who are already using PillPal to stay healthy and independent.
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card rounded-lg p-4 border-white/20 hover:border-white/40 transition-all duration-300"
                  data-testid={`benefit-${index}`}
                >
                  <div className="flex items-center text-white">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                    </motion.div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  asChild
                  variant="glass"
                  size="xl"
                  className="glass-button-primary w-full sm:w-auto justify-center px-6 sm:px-8"
                  data-testid="button-start-tracking"
                >
                  <a href="https://pillpal-app.ankanroy.in" className="flex items-center justify-center">
                    <Sparkles className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate text-base sm:text-lg hidden sm:inline">Start Tracking Your Medications</span>
                    <span className="truncate text-base sm:text-lg sm:hidden">Start Tracking</span>
                    <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                  </a>
                </Button>
              </motion.div>
              
              <motion.p 
                className="text-white/70 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                No installation required • Works in any web browser • Start in seconds
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}