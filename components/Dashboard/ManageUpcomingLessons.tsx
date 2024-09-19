'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, getDoc, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Lesson {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    studentId: string;
    studentName: string;
}

interface UserData extends DocumentData {
    firstName?: string;
    lastName?: string;
}

export default function ManageUpcomingLessons() {
    const { user } = useUser()
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [rescheduleData, setRescheduleData] = useState({ lessonId: '', newDate: '', newStartTime: '', newEndTime: '' })

    useEffect(() => {
        if (user) {
            fetchLessons()
        }
    }, [user])

    const fetchLessons = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const lessonsRef = collection(db, 'bookings')
            const q = query(
                lessonsRef,
                where('teacherId', '==', user.id),
                where('status', '==', 'scheduled'),
                orderBy('date'),
                orderBy('startTime')
            )
            const querySnapshot = await getDocs(q)
            const lessonPromises = querySnapshot.docs.map(async (docSnapshot) => {
                const lessonData = docSnapshot.data()
                // Fetch student name
                const studentDocRef = doc(db, 'users', lessonData.studentId)
                const studentDocSnapshot = await getDoc(studentDocRef)
                const studentData = studentDocSnapshot.data() as UserData | undefined
                const studentName = studentData 
                    ? `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Unknown Student'
                    : 'Unknown Student'
                return {
                    id: docSnapshot.id,
                    ...lessonData,
                    studentName
                } as Lesson
            })
            const fetchedLessons = await Promise.all(lessonPromises)
            setLessons(fetchedLessons)
        } catch (error) {
            console.error('Error fetching lessons:', error)
            toast({ title: "Error", description: "Failed to fetch lessons. Please try again.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelLesson = async (lessonId: string) => {
        try {
            await deleteDoc(doc(db, 'bookings', lessonId))
            setLessons(lessons.filter(lesson => lesson.id !== lessonId))
            toast({ title: "Success", description: "Lesson cancelled successfully." })
        } catch (error) {
            console.error('Error cancelling lesson:', error)
            toast({ title: "Error", description: "Failed to cancel lesson. Please try again.", variant: "destructive" })
        }
    }

    const handleRescheduleLesson = async () => {
        setIsRescheduling(true)
        try {
            const { lessonId, newDate, newStartTime, newEndTime } = rescheduleData
            await updateDoc(doc(db, 'bookings', lessonId), {
                date: newDate,
                startTime: newStartTime,
                endTime: newEndTime
            })
            await fetchLessons() // Refetch lessons to update the list
            toast({ title: "Success", description: "Lesson rescheduled successfully." })
            setIsRescheduling(false)
            setRescheduleData({ lessonId: '', newDate: '', newStartTime: '', newEndTime: '' })
        } catch (error) {
            console.error('Error rescheduling lesson:', error)
            toast({ title: "Error", description: "Failed to reschedule lesson. Please try again.", variant: "destructive" })
            setIsRescheduling(false)
        }
    }

    if (isLoading) {
        return <Skeleton className="w-full h-48" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Upcoming Lessons</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    {lessons.map((lesson) => (
                        <div key={lesson.id} className="flex justify-between items-center mb-4 p-2 border rounded">
                            <div>
                                <p className="font-semibold">{lesson.title}</p>
                                <p>{lesson.date} | {lesson.startTime} - {lesson.endTime}</p>
                                <p>Student: {lesson.studentName}</p>
                            </div>
                            <div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="mr-2">Reschedule</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reschedule Lesson</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="newDate" className="text-right">
                                                    New Date
                                                </Label>
                                                <Input
                                                    id="newDate"
                                                    type="date"
                                                    className="col-span-3"
                                                    value={rescheduleData.newDate}
                                                    onChange={(e) => setRescheduleData({...rescheduleData, lessonId: lesson.id, newDate: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="newStartTime" className="text-right">
                                                    New Start Time
                                                </Label>
                                                <Input
                                                    id="newStartTime"
                                                    type="time"
                                                    className="col-span-3"
                                                    value={rescheduleData.newStartTime}
                                                    onChange={(e) => setRescheduleData({...rescheduleData, newStartTime: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="newEndTime" className="text-right">
                                                    New End Time
                                                </Label>
                                                <Input
                                                    id="newEndTime"
                                                    type="time"
                                                    className="col-span-3"
                                                    value={rescheduleData.newEndTime}
                                                    onChange={(e) => setRescheduleData({...rescheduleData, newEndTime: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleRescheduleLesson} disabled={isRescheduling}>
                                            {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="destructive" onClick={() => handleCancelLesson(lesson.id)}>Cancel</Button>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}