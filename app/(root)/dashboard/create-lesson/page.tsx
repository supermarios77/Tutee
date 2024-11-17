'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateLesson() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
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
        // Changed from 'lessons' to 'bookings'
        teacherId: user.id,
        title,
        description,
        date,
        startTime: time, // Changed from 'time' to 'startTime' to match the existing schema
        endTime: calculateEndTime(time), // You'll need to implement this function
        callId: call.id,
        status: 'scheduled',
      });

      toast({ title: 'Lesson created successfully' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: 'Failed to create lesson',
        description: 'Please try again',
      });
    }
  };

  // Helper function to calculate end time (e.g., 1 hour after start time)
  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Lesson</CardTitle>
      </CardHeader>
      <CardContent>
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
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create Lesson
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
