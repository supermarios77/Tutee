'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  studentId: string;
  studentName: string;
  status: 'scheduled' | 'rescheduling' | 'cancelled';
  requestedDate?: string;
  requestedTime?: string;
}

export default function ManageUpcomingLessons() {
  const { user } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const lessonsRef = collection(db, 'bookings');
      const q = query(
        lessonsRef,
        where('teacherId', '==', user.id),
        where('status', '==', 'scheduled'),
        orderBy('date'),
        orderBy('startTime'),
      );
      const querySnapshot = await getDocs(q);
      const fetchedLessons = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            studentName: doc.data().studentName || 'Unknown Student',
          }) as Lesson,
      );
      setLessons(fetchedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch lessons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', lessonId));
      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      toast({
        title: 'Success',
        description: 'Lesson cancelled successfully.',
      });
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel lesson. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditing(true);
  };

  const handleUpdateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      await updateDoc(doc(db, 'bookings', editingLesson.id), {
        title: editingLesson.title,
        date: editingLesson.date,
        startTime: editingLesson.startTime,
        endTime: editingLesson.endTime,
      });
      setLessons(
        lessons.map((lesson) =>
          lesson.id === editingLesson.id ? editingLesson : lesson,
        ),
      );
      setIsEditing(false);
      toast({ title: 'Success', description: 'Lesson updated successfully.' });
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lesson. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveReschedule = async (lessonId: string) => {
    try {
      const lessonRef = doc(db, 'bookings', lessonId);
      const lessonDoc = await getDoc(lessonRef);
      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data() as Lesson;
        await updateDoc(lessonRef, {
          date: lessonData.requestedDate,
          startTime: lessonData.requestedTime,
          status: 'scheduled',
          requestedDate: null,
          requestedTime: null,
        });
        fetchLessons(); // Refresh the lessons list
        toast({
          title: 'Success',
          description: 'Reschedule request approved.',
        });
      }
    } catch (error) {
      console.error('Error approving reschedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve reschedule. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectReschedule = async (lessonId: string) => {
    try {
      const lessonRef = doc(db, 'bookings', lessonId);
      await updateDoc(lessonRef, {
        status: 'scheduled',
        requestedDate: null,
        requestedTime: null,
      });
      fetchLessons(); // Refresh the lessons list
      toast({ title: 'Success', description: 'Reschedule request rejected.' });
    } catch (error) {
      console.error('Error rejecting reschedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject reschedule. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-48" />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Upcoming Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <div key={lesson.id} className="mb-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                <p>Date: {lesson.date}</p>
                <p>
                  Time: {lesson.startTime} - {lesson.endTime}
                </p>
                <p>Student: {lesson.studentName}</p>
                {lesson.status === 'rescheduling' && (
                  <div className="mt-2">
                    <p className="text-yellow-500">Reschedule Requested:</p>
                    <p>New Date: {lesson.requestedDate}</p>
                    <p>New Time: {lesson.requestedTime}</p>
                    <div className="mt-2 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveReschedule(lesson.id)}
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectReschedule(lesson.id)}
                      >
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteLesson(lesson.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>No upcoming lessons scheduled.</p>
          )}
        </ScrollArea>
      </CardContent>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <form onSubmit={handleUpdateLesson} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingLesson.title}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editingLesson.date}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={editingLesson.startTime}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      startTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editingLesson.endTime}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      endTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button type="submit">Update Lesson</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
