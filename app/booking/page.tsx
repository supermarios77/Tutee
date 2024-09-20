'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import LessonBooking from '@/components/Bookings/LessonBooking'
import { motion } from 'framer-motion'

export default function BookingPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [existingPlan, setExistingPlan] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    } else if (isLoaded && isSignedIn && user) {
      checkOnboarding()
    }
  }, [isLoaded, isSignedIn, user, router])

  const checkOnboarding = async () => {
    if (!user) return
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id))
      const userData = userDoc.data()
      if (userData?.onboardingCompleted) {
        setIsOnboarded(true)
        setExistingPlan(!!userData.subscriptionPlan) // Set existingPlan based on user data
      } else {
        router.push('/onboarding')
      }
    } catch (error) {
      logger.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 to-black">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isOnboarded) {
    return null // This will prevent any flash of content before redirecting to onboarding
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-black to-purple-900">
      <LessonBooking existingPlan={existingPlan} />
    </div>
  )
}