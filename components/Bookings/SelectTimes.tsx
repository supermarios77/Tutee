import React, { useState, useEffect } from 'react';
import { TimeSlot } from '@/types/booking';
import { Button } from "@/components/ui/button";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isSameDay, isValid, parseISO } from 'date-fns';
import logger from '@/lib/logger';

interface SelectTimesProps {
  selectedDates: Date[];
  selectedTeacherId: string;
  selectedSlots: TimeSlot[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

export const SelectTimes: React.FC<SelectTimesProps> = ({
  selectedDates,
  selectedTeacherId,
  selectedSlots,
  setSelectedSlots,
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      try {
        const slotsRef = doc(db, 'availableSlots', selectedTeacherId);
        const slotsSnapshot = await getDoc(slotsRef);

        if (slotsSnapshot.exists()) {
          const slots = slotsSnapshot.data().slots as { start: { seconds: number }, end: { seconds: number } }[];
          const filteredSlots = slots.filter(slot => 
            selectedDates.some(date => 
              isSameDay(new Date(slot.start.seconds * 1000), date)
            )
          ).map(slot => ({
            start: new Date(slot.start.seconds * 1000),
            end: new Date(slot.end.seconds * 1000)
          }));
          setAvailableSlots(filteredSlots);
        } else {
          logger.warn('No available slots found for this teacher');
        }
      } catch (error) {
        logger.error('Error fetching available slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedTeacherId, selectedDates]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlots(prev => {
      if (prev.some(s => s.start.getTime() === slot.start.getTime() && s.end.getTime() === slot.end.getTime())) {
        return prev.filter(s => s.start.getTime() !== slot.start.getTime() || s.end.getTime() !== slot.end.getTime());
      } else {
        return [...prev, slot];
      }
    });
  };

  if (isLoading) {
    return <div>Loading available time slots...</div>;
  }

  return (
    <div>
      {selectedDates.map(date => (
        <div key={date.toISOString()}>
          <h3>{format(date, 'MMMM d, yyyy')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots
              .filter(slot => isSameDay(slot.start, date))
              .map(slot => (
                <Button
                  key={slot.start.toISOString()}
                  onClick={() => handleSelectSlot(slot)}
                  variant={selectedSlots.some(s => 
                    s.start.getTime() === slot.start.getTime() && 
                    s.end.getTime() === slot.end.getTime()
                  ) ? 'default' : 'outline'}
                >
                  {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                </Button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};