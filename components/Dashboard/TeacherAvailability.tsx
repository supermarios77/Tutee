'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Availability {
  [day: string]: string[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function TeacherAvailability() {
  const { user } = useUser()
  const [availability, setAvailability] = useState<Availability>({})
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchAvailability()
    }
  }, [user])

  const fetchAvailability = async () => {
    if (!user) return
    const availabilityRef = doc(db, 'teacherAvailability', user.id)
    const availabilityDoc = await getDoc(availabilityRef)
    if (availabilityDoc.exists()) {
      setAvailability(availabilityDoc.data() as Availability)
    } else {
      // Initialize with empty availability if not set
      const initialAvailability: Availability = {}
      daysOfWeek.forEach(day => {
        initialAvailability[day] = []
      })
      setAvailability(initialAvailability)
    }
  }

  const handleAvailabilityChange = (day: string, time: string) => {
    setAvailability(prev => {
      const updatedAvailability = { ...prev }
      if (updatedAvailability[day].includes(time)) {
        updatedAvailability[day] = updatedAvailability[day].filter(t => t !== time)
      } else {
        updatedAvailability[day] = [...updatedAvailability[day], time].sort()
      }
      return updatedAvailability
    })
  }

  const saveAvailability = async () => {
    if (!user) return
    try {
      await setDoc(doc(db, 'teacherAvailability', user.id), availability)
      toast({ title: "Success", description: "Availability updated successfully." })
    } catch (error) {
      logger.error('Error saving availability:', error)
      toast({ title: "Error", description: "Failed to update availability. Please try again.", variant: "destructive" })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Your Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {daysOfWeek.map(day => (
          <div key={day} className="mb-4">
            <h3 className="font-semibold mb-2">{day}</h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(time => (
                <div key={`${day}-${time}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${day}-${time}`}
                    checked={availability[day]?.includes(time)}
                    onCheckedChange={() => handleAvailabilityChange(day, time)}
                  />
                  <Label htmlFor={`${day}-${time}`}>{time}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={saveAvailability} className="mt-4">Save Availability</Button>
      </CardContent>
    </Card>
  )
}