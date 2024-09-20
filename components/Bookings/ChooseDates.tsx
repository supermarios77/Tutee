import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { SubscriptionPlan, TimeSlot } from '@/types/booking';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, endOfDay, isSameDay } from 'date-fns';
import logger from '@/lib/logger';

interface ChooseDatesProps {
  selectedPlan: SubscriptionPlan;
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  selectedTeacherId: string;
}

export const ChooseDates: React.FC<ChooseDatesProps> = ({ selectedPlan, selectedDates, setSelectedDates, selectedTeacherId }) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      try {
        const slotsRef = doc(db, 'availableSlots', selectedTeacherId);
        const slotsSnapshot = await getDoc(slotsRef);

        if (slotsSnapshot.exists()) {
          const slots = slotsSnapshot.data().slots as TimeSlot[];
          const availableDates = [...new Set(slots.map(slot => startOfDay(slot.start.toDate())))];
          setAvailableDates(availableDates);
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
  }, [selectedTeacherId]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDates(prev => {
        if (prev.some(d => isSameDay(d, date))) {
          return prev.filter(d => !isSameDay(d, date));
        } else if (prev.length < selectedPlan.sessionsPerWeek) {
          return [...prev, date];
        }
        return prev;
      });
    }
  };

  if (isLoading) {
    return <div>Loading available dates...</div>;
  }

  return (
    <div>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={handleSelect}
        disabled={(date) => !availableDates.some(d => isSameDay(d, date))}
      />
      <p>Please select {selectedPlan.sessionsPerWeek} dates</p>
    </div>
  );
};