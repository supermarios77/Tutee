"use client"
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import LessonBooking from '@/components/Bookings/LessonBooking'

export default function BookingPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    } else if (isLoaded && isSignedIn && user) {
      const checkOnboarding = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.id))
        const userData = userDoc.data()
        if (userData?.onboardingCompleted) {
          setIsOnboarded(true)
        } else {
          router.push('/onboarding')
        }
      }
      checkOnboarding()
    }
  }, [isLoaded, isSignedIn, user, router])

  if (!isLoaded || !isSignedIn || !isOnboarded) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Your Free Lesson</h1>
      <LessonBooking />
    </div>
  )
}