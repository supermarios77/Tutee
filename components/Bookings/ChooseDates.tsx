import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isFuture } from 'date-fns';
import { SubscriptionPlan } from '@/types/booking';

interface ChooseDatesProps {
  selectedPlan: SubscriptionPlan;
  selectedDates: Date[];
  onSelectDates: (dates: Date[]) => void;
}

export const ChooseDates: React.FC<ChooseDatesProps> = ({
  selectedPlan,
  selectedDates,
  onSelectDates
}) => {
  const [currentWeek, setCurrentWeek] = React.useState(startOfWeek(new Date()));

  const renderWeekCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {format(currentWeek, 'MMMM yyyy')}
          </h3>
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <Button
              key={index}
              onClick={() => {
                const newSelectedDates = selectedDates.includes(day)
                  ? selectedDates.filter(d => !isSameDay(d, day))
                  : [...selectedDates, day].slice(-selectedPlan.sessionsPerWeek);
                onSelectDates(newSelectedDates);
              }}
              variant={selectedDates.some(d => isSameDay(d, day)) ? "default" : "outline"}
              className="flex flex-col items-center p-2 h-auto"
              disabled={!isFuture(day)}
            >
              <span className="text-xs">{format(day, 'EEE')}</span>
              <span className="text-lg">{format(day, 'd')}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Choose Your Dates</h2>
      <p className="mb-2">Select {selectedPlan.sessionsPerWeek} day{selectedPlan.sessionsPerWeek > 1 ? 's' : ''} for your weekly sessions.</p>
      {renderWeekCalendar()}
    </>
  );
};