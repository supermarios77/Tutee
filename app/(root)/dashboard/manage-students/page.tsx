'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ManageStudents() {
    const { user } = useUser()
    const [students, setStudents] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            fetchStudents()
        }
    }, [user])

    const fetchStudents = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const studentsRef = collection(db, 'users')
            const q = query(
                studentsRef,
                where('role', '==', 'user'),
                orderBy('lastName'),
                orderBy('firstName')
            )
            const querySnapshot = await getDocs(q)
            const studentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User))
            setStudents(studentsData)
        } catch (error) {
            console.error('Error fetching students:', error)
            toast({ title: "Error", description: "Failed to fetch students. Please try again.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateStudent = async (studentId: string, updates: Partial<User>) => {
        try {
            await updateDoc(doc(db, 'users', studentId), updates)
            setStudents(students.map(student => 
                student.id === studentId ? { ...student, ...updates } : student
            ))
            toast({ title: "Success", description: "Student updated successfully." })
        } catch (error) {
            console.error('Error updating student:', error)
            toast({ title: "Error", description: "Failed to update student. Please try again.", variant: "destructive" })
        }
    }

    const filteredStudents = students.filter(student => 
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return <Skeleton className="w-full h-[400px]" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Students</CardTitle>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.firstName} {student.lastName}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.lastLoginAt?.toLocaleString() || 'Never'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateStudent(student.id, { hasClaimedFreeTrial: !student.hasClaimedFreeTrial })}
                                    >
                                        {student.hasClaimedFreeTrial ? 'Remove Free Trial' : 'Grant Free Trial'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}