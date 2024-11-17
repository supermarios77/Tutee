'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types/booking'; // Add this import
import { checkForConflicts } from '@/utils/bookingUtils';

interface ExtendedUser extends User {
  fullName?: string;
  username?: string;
}

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: () => void;
  students: ExtendedUser[];
}

export default function CreateLessonModal({
  isOpen,
  onClose,
  onLessonCreated,
  students,
}: CreateLessonModalProps) {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const { toast } = useToast();

  // Remove the useEffect hook that fetches students

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudent) return;

    try {
      // Check for conflicts
      const hasConflict = await checkForConflicts(
        user.id,
        date,
        startTime,
        endTime,
      );
      if (hasConflict) {
        toast({
          title: 'Error',
          description:
            'There is a scheduling conflict. Please choose a different time.',
          variant: 'destructive',
        });
        return;
      }

      // Create a Stream Video call
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) throw new Error('Stream API key is not defined');

      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName || user.username || user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to get Stream token');

      const { token } = await response.json();

      const client = new StreamVideoClient({
        apiKey,
        user: { id: user.id },
        token,
      });
      const call = client.call('default', crypto.randomUUID());
      await call.getOrCreate();

      // Add lesson to Firebase
      await addDoc(collection(db, 'bookings'), {
        teacherId: user.id,
        studentId: selectedStudent,
        title,
        description,
        date,
        startTime: startTime,
        endTime: calculateEndTime(startTime),
        callId: call.id,
        status: 'scheduled',
      });

      toast({ title: 'Lesson created successfully' });
      onLessonCreated();
      onClose();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: 'Failed to create lesson',
        description: 'Please try again',
      });
    }
  };

  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <Input
            placeholder="Lesson Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Lesson Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Select onValueChange={setSelectedStudent} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student: ExtendedUser) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.fullName ||
                    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                    student.username ||
                    'Unnamed User'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create Lesson
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
