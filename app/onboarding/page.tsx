'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Target, Rocket, CheckCircle } from 'lucide-react'

const steps = [
  { title: 'English Level', icon: BookOpen },
  { title: 'Learning Goal', icon: Target },
  { title: 'Confirmation', icon: Rocket },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [englishLevel, setEnglishLevel] = useState('')
  const [learningGoal, setLearningGoal] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await setDoc(doc(db, 'users', user.id), {
        englishLevel,
        learningGoal,
        onboardingCompleted: true
      }, { merge: true })

      router.push('/booking')
    } catch (error) {
      logger.error('Error saving onboarding data:', error)
    }
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-blue-600 p-8 text-white flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Tutee</h1>
            <p className="mb-8">Let's personalize your learning journey in just a few steps!</p>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${index <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                    }`}>
                    {index < currentStep ? <CheckCircle size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={index <= currentStep ? 'font-semibold' : 'text-blue-200'}>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 0 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">What's your English level?</h2>
                    <Select onValueChange={setEnglishLevel} value={englishLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your English level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">What's your main learning goal?</h2>
                    <Input
                      placeholder="E.g., Improve conversation skills"
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                    />
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Confirm Your Details</h2>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-300">English Level: <span className="font-semibold">{englishLevel}</span></p>
                      <p className="text-gray-600 dark:text-gray-300">Learning Goal: <span className="font-semibold">{learningGoal}</span></p>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} disabled={currentStep === 0 && !englishLevel || currentStep === 1 && !learningGoal}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Complete Profile</Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}