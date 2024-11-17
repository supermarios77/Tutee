import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import { TimeSlot } from '@/types/booking';

interface SelectTimesProps {
  selectedDates: Date[];
  selectedTeacherId: string;
  selectedSlots: TimeSlot[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  availableSlots: TimeSlot[];
}

export const SelectTimes: React.FC<SelectTimesProps> = ({
  selectedDates,
  selectedTeacherId,
  selectedSlots,
  setSelectedSlots,
  availableSlots,
}) => {
  if (availableSlots.length === 0) {
    return (
      <p>
        No available slots for the selected dates. Please choose different dates
        or a different teacher.
      </p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Select Your Times
      </h2>
      {selectedDates.map((date, dateIndex) => (
        <Card key={dateIndex} className="mb-4">
          <CardHeader>
            <CardTitle>{format(date, 'EEEE, MMMM d')}</CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlots.filter((slot) => isSameDay(slot.start, date))
              .length === 0 ? (
              <p>
                No available slots for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSlots
                  .filter((slot) => isSameDay(slot.start, date))
                  .map((slot, slotIndex) => (
                    <Button
                      key={slotIndex}
                      onClick={() => {
                        const newSelectedSlots = [...selectedSlots];
                        newSelectedSlots[dateIndex] = slot;
                        setSelectedSlots(newSelectedSlots);
                      }}
                      variant={
                        selectedSlots[dateIndex] === slot
                          ? 'default'
                          : 'outline'
                      }
                      className="text-sm"
                    >
                      {format(slot.start, 'HH:mm')} -{' '}
                      {format(slot.end, 'HH:mm')}
                    </Button>
                  ))}
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
              {format(selectedDates[index], 'EEEE, MMMM d')}:{' '}
              {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
