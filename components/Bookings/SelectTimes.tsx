// app/components/booking/SelectTimes.tsx
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import { SubscriptionPlan, TimeSlot } from '../../types/booking';

interface SelectTimesProps {
  selectedPlan: SubscriptionPlan;
  selectedDates: Date[];
  selectedSlots: TimeSlot[];
  availableSlots: TimeSlot[];
  onSelectSlots: (slots: TimeSlot[]) => void;
}

export const SelectTimes: React.FC<SelectTimesProps> = ({
  selectedPlan,
  selectedDates,
  selectedSlots,
  availableSlots,
  onSelectSlots
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Times</h2>
      {selectedDates.map((date, dateIndex) => (
        <div key={dateIndex} className="mb-4">
          <h3 className="font-semibold mb-2">{format(date, 'EEEE, MMMM d')}</h3>
          {availableSlots.filter(slot => isSameDay(slot.start, date)).length === 0 ? (
            <p>No available slots for this date. Please select another date.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots
                .filter(slot => isSameDay(slot.start, date))
                .map((slot, slotIndex) => (
                  <Button
                    key={slotIndex}
                    onClick={() => {
                      const newSelectedSlots = [...selectedSlots];
                      newSelectedSlots[dateIndex] = slot;
                      onSelectSlots(newSelectedSlots);
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
        </div>
      ))}
    </>
  );
};
