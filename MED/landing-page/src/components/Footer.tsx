'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Footer() {
  return (
    <footer className="relative section-padding overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="floating-orb w-72 h-72 bg-purple-700 bottom-10 left-10" style={{animationDelay: '1s'}} />
        <div className="floating-orb w-64 h-64 bg-teal-600 top-10 right-20" style={{animationDelay: '3s'}} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <Card className="glass-card border-white/30 p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div 
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-8 w-8 text-red-400 mr-3" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white">PillPal</h3>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="ml-3"
              >
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </motion.div>
            </motion.div>
            
            <p className="text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
              Empowering seniors to live healthier, more independent lives through smart medication management.
            </p>
            
            <div className="glass-card border-white/20 rounded-full py-4 px-8 inline-block">
              <p className="text-white/70 text-sm">
                © {new Date().getFullYear()} PillPal. Made with{" "}
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block"
                >
                  ❤️
                </motion.span>
                {" "}for healthier communities.
              </p>
            </div>
          </motion.div>
        </Card>
      </div>
    </footer>
  )
}