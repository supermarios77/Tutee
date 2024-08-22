'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { motion, useAnimation, Variants, useInView } from 'framer-motion'
import { BookOpenIcon, GraduationCapIcon, GlobeIcon, Zap, MessageCircle, PenTool, Headphones } from 'lucide-react'
import Link from 'next/link'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

const floatingIconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
}

interface FloatingIconProps {
  icon: React.ElementType;
  delay: number;
  x: string;
  y: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon: Icon, delay, x, y }) => (
  <motion.div
    className="absolute text-blue-400 dark:text-blue-300 filter drop-shadow-lg"
    style={{ left: x, top: y }}
    variants={floatingIconVariants}
    initial="hidden"
    animate="visible"
    transition={{
      delay,
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    }}
  >
    <Icon size={48} className="filter drop-shadow-md" />
  </motion.div>
)

export default function Hero() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()

  if (isInView) {
    controls.start('visible')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-black min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <svg className="w-full h-full" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M1920 0H0V1080H1920V0Z"
            fill="url(#grid-pattern)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <defs>
            <pattern id="grid-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
              <path d="M100 0H0V100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
        </svg>
      </div>
      
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="max-w-3xl text-center mx-auto"
        >
          <motion.h1 
            variants={itemVariants}
            className="block text-5xl font-bold text-white sm:text-6xl md:text-7xl mb-8"
          >
            Unlock Your English Potential with Expert Tutoring
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-blue-100 mb-10"
          >
            Transform your language skills with personalized lessons from certified professionals. Sign up now and get your first lesson free!
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex justify-center mb-16"
          >
            <Button asChild size="lg" className="text-xl px-10 py-6 bg-white text-blue-900 hover:bg-blue-100 transition-colors duration-300">
              <Link href="/sign-up">
                Start Your Free Lesson <Zap className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <div className="relative h-80 sm:h-96 md:h-[30rem] mt-10 mb-20">
          <motion.div 
            className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-gradient-to-b from-orange-500 to-orange-300 p-1 rounded-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            <div className="bg-blue-900 w-full h-full rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-orange-400" />
            </div>
          </motion.div>

          <motion.div 
            className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-gradient-to-t from-blue-600 to-cyan-400 p-1 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            <div className="bg-blue-900 w-full h-full rounded-full flex items-center justify-center">
              <GlobeIcon className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-cyan-400" />
            </div>
          </motion.div>

          <FloatingIcon icon={MessageCircle} delay={0.5} x="5%" y="15%" />
          <FloatingIcon icon={PenTool} delay={0.7} x="85%" y="25%" />
          <FloatingIcon icon={Headphones} delay={0.9} x="75%" y="70%" />
          <FloatingIcon icon={GraduationCapIcon} delay={1.1} x="15%" y="75%" />
        </div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-12"
        >
          {[
            { icon: BookOpenIcon, title: "Expert Tutors", description: "Learn from certified English language professionals" },
            { icon: GraduationCapIcon, title: "Personalized Learning", description: "Tailored lessons to meet your specific goals" },
            { icon: GlobeIcon, title: "Global Community", description: "Connect with learners from around the world" },
          ].map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              <feature.icon className="w-16 h-16 text-blue-300 mb-6" />
              <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-lg text-blue-100">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}