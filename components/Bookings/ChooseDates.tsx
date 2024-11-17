import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  isFuture,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SubscriptionPlan } from '@/types/booking';

interface ChooseDatesProps {
  selectedPlan: SubscriptionPlan;
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const ChooseDates: React.FC<ChooseDatesProps> = ({
  selectedPlan,
  selectedDates,
  setSelectedDates,
}) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  const renderWeekCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {format(currentWeek, 'MMMM yyyy')}
          </h3>
          <Button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (selectedDates.find((d) => isSameDay(d, day))) {
                        setSelectedDates(
                          selectedDates.filter((d) => !isSameDay(d, day)),
                        );
                      } else if (
                        selectedDates.length < selectedPlan.sessionsPerWeek
                      ) {
                        setSelectedDates([...selectedDates, day]);
                      }
                    }}
                    variant={
                      selectedDates.find((d) => isSameDay(d, day))
                        ? 'default'
                        : 'outline'
                    }
                    className="flex flex-col items-center p-2 h-auto"
                    disabled={
                      !isFuture(day) ||
                      (selectedDates.length >= selectedPlan.sessionsPerWeek &&
                        !selectedDates.find((d) => isSameDay(d, day)))
                    }
                  >
                    <span className="text-xs">{format(day, 'EEE')}</span>
                    <span className="text-lg">{format(day, 'd')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFuture(day)
                    ? selectedDates.find((d) => isSameDay(d, day))
                      ? 'Click to unselect'
                      : 'Click to select'
                    : 'Past date'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Choose Your Dates
      </h2>
      <p className="mb-2">
        Select {selectedPlan.sessionsPerWeek} day
        {selectedPlan.sessionsPerWeek > 1 ? 's' : ''} for your weekly sessions.
      </p>
      {renderWeekCalendar()}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Selected Dates:</h3>
        <ul className="list-disc list-inside">
          {selectedDates.map((date, index) => (
            <li key={index}>{format(date, 'EEEE, MMMM d, yyyy')}</li>
          ))}
        </ul>
      </div>
    </>
  );
};
