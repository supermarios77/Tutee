'use client'

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const roles = ['student', 'teacher', 'admin', 'banned'];

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
        } catch (error) {
            logger.error('Error fetching users:', error);
            toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            toast({ title: "Success", description: "User role updated successfully." });
        } catch (error) {
            logger.error('Error updating user role:', error);
            toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
        }
    };

    if (isLoading) {
        return <div>Loading users...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role}
                                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}