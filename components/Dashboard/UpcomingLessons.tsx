import React from 'react';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UpcomingLessonsProps {
  lessons: Booking[];
  isLoading: boolean;
}

const UpcomingLessons: React.FC<UpcomingLessonsProps> = ({
  lessons,
  isLoading,
}) => {
  if (isLoading) {
    return <div>Loading upcoming lessons...</div>;
  }

  if (lessons.length === 0) {
    return <div>No upcoming lessons scheduled.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Lessons</h2>
      {lessons.map((lesson) => (
        <Card key={lesson.id}>
          <CardHeader>
            <CardTitle>
              {format(new Date(lesson.date), 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Time: {lesson.startTime} - {lesson.endTime}
            </p>
            <p>Teacher: {lesson.teacherId}</p>
            <p>Type: {lesson.lessonType}</p>
            <Button asChild className="mt-2">
              <Link href={`/meeting/${lesson.id}`}>Join Lesson</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UpcomingLessons;
