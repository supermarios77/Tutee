import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay, parseISO } from 'date-fns';
import { TimeSlot } from '@/types/booking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  setSelectedSlots
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const teacherDoc = await getDoc(doc(db, 'availableSlots', selectedTeacherId));
        if (teacherDoc.exists()) {
          const slots = teacherDoc.data().slots as { start: string; end: string }[];
          const parsedSlots: TimeSlot[] = slots.map(slot => ({
            start: parseISO(slot.start),
            end: parseISO(slot.end)
          }));
          setAvailableSlots(parsedSlots.filter(slot => 
            selectedDates.some(date => isSameDay(slot.start, date))
          ));
        } else {
          setError("No available slots found for this teacher.");
        }
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError("Failed to load available slots. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedTeacherId && selectedDates.length > 0) {
      fetchAvailableSlots();
    }
  }, [selectedTeacherId, selectedDates]);

  if (isLoading) {
    return <p>Loading available slots...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Times</h2>
      {selectedDates.map((date, dateIndex) => (
        <Card key={dateIndex} className="mb-4">
          <CardHeader>
            <CardTitle>{format(date, 'EEEE, MMMM d')}</CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlots.filter(slot => isSameDay(slot.start, date)).length === 0 ? (
              <p>No available slots for this date. Please select another date.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSlots
                  .filter(slot => isSameDay(slot.start, date))
                  .map((slot, slotIndex) => (
                    <Button
                      key={slotIndex}
                      onClick={() => {
                        const newSelectedSlots = [...selectedSlots];
                        newSelectedSlots[dateIndex] = slot;
                        setSelectedSlots(newSelectedSlots);
                      }}
                      variant={selectedSlots[dateIndex] === slot ? "default" : "outline"}
                      className="text-sm"
                    >
                      {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                    </Button>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Selected Time Slots:</h3>
        <ul className="list-disc list-inside">
          {selectedSlots.map((slot, index) => (
            <li key={index}>
              {format(selectedDates[index], 'EEEE, MMMM d')}: {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};