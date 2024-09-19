import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LessonBooking from '@/components/Bookings/LessonBooking';

interface BookLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookLessonModal({ isOpen, onClose }: BookLessonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Book a New Lesson</DialogTitle>
        </DialogHeader>
        <LessonBooking />
      </DialogContent>
    </Dialog>
  );
}