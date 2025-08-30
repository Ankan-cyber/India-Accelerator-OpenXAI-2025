'use client'

import { motion } from 'framer-motion'
import { Clock, Brain, Bell, BarChart3, Shield, Smartphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
  {
    icon: Clock,
    title: 'Smart Reminders',
    description: 'Never forget a dose with customizable alerts that work around your schedule.',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Brain,
    title: 'AI Health Tips',
    description: 'Get personalized health advice based on your medications and health conditions.',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    icon: Bell,
    title: 'Gentle Notifications',
    description: 'Friendly, non-intrusive reminders that respect your daily routine.',
    gradient: 'from-green-400 to-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Visual charts show your medication adherence and health improvements over time.',
    gradient: 'from-orange-400 to-red-400',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your health data stays secure with enterprise-grade encryption and privacy protection.',
    gradient: 'from-indigo-400 to-blue-400',
  },
  {
    icon: Smartphone,
    title: 'Easy to Use',
    description: 'Large buttons, clear text, and simple navigation designed specifically for seniors.',
    gradient: 'from-teal-400 to-cyan-400',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative section-padding overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="floating-orb w-72 h-72 bg-teal-600 top-20 right-20" style={{animationDelay: '1s'}} />
        <div className="floating-orb w-96 h-96 bg-purple-700 bottom-20 left-20" style={{animationDelay: '3s'}} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block glass-card rounded-full px-6 py-3 mb-8 border-white/30"
          >
            <span className="text-white font-medium">✨ Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to Stay{" "}
            <span className="bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
              Healthy
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            PillPal combines the simplicity seniors need with the smart features families want.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
              data-testid={`feature-card-${index}`}
            >
              <Card className="glass-card border-white/20 hover:border-white/40 transition-all duration-500 h-full">
                <CardHeader>
                  <motion.div 
                    className={`glass-card rounded-full p-4 w-16 h-16 mb-4 bg-gradient-to-br ${feature.gradient} border-white/30`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <CardTitle className="text-white group-hover:text-cyan-300 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-white/80 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}