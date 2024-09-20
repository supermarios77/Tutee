'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
            logger.error('Error fetching students:', error)
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
            logger.error('Error updating student:', error)
            toast({ title: "Error", description: "Failed to update student. Please try again.", variant: "destructive" })
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        try {
            await deleteDoc(doc(db, 'users', studentId))
            setStudents(students.filter(student => student.id !== studentId))
            toast({ title: "Success", description: "Student deleted successfully." })
        } catch (error) {
            logger.error('Error deleting student:', error)
            toast({ title: "Error", description: "Failed to delete student. Please try again.", variant: "destructive" })
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
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.firstName} {student.lastName}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={student.role}
                                        onValueChange={(value) => handleUpdateStudent(student.id, { role: value })}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(student.updatedAt).toLocaleString() || 'Never'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateStudent(student.id, { hasClaimedFreeTrial: !student.hasClaimedFreeTrial })}
                                        className="mr-2"
                                    >
                                        {student.hasClaimedFreeTrial ? 'Remove Free Trial' : 'Grant Free Trial'}
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the student's account and remove their data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}