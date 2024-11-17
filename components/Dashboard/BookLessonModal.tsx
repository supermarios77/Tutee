import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LessonBooking from '@/components/Bookings/LessonBooking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManageUpcomingLessons from './ManageUpcomingLessons';

interface BookLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookLessonModal({
  isOpen,
  onClose,
}: BookLessonModalProps) {
  const { user } = useUser();
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserPlan = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setHasPaidPlan(userData.hasPaidPlan || false);
        }
        setIsLoading(false);
      }
    };

    checkUserPlan();
  }, [user]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {hasPaidPlan ? 'Manage Your Lessons' : 'Book a New Lesson'}
          </DialogTitle>
        </DialogHeader>
        {hasPaidPlan ? (
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Lessons</TabsTrigger>
              <TabsTrigger value="book">Book New Lesson</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <ManageUpcomingLessons />
            </TabsContent>
            <TabsContent value="book">
              <LessonBooking existingPlan={true} />
            </TabsContent>
          </Tabs>
        ) : (
          <LessonBooking existingPlan={false} />
        )}
      </DialogContent>
    </Dialog>
  );
}
