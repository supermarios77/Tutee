"use client"
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
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
      console.error('Error saving onboarding data:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <Select onValueChange={setEnglishLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select your English level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="What's your main learning goal?"
          value={learningGoal}
          onChange={(e) => setLearningGoal(e.target.value)}
        />
        <Button type="submit">Complete Profile</Button>
      </form>
    </div>
  )
}