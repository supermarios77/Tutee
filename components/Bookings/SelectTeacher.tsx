import React from 'react';
import { Teacher } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SelectTeacherProps {
  onSelectTeacher: (teacherId: string) => void;
  selectedPlan: string;
  teachers: Teacher[];
}

export const SelectTeacher: React.FC<SelectTeacherProps> = ({
  onSelectTeacher,
  selectedPlan,
  teachers,
}) => {
  const isTeacherAvailable = (teacher: Teacher) => {
    if (!teacher.availability) return false;
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    return (
      teacher.availability[today] && teacher.availability[today].length > 0
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachers.map((teacher) => (
        <Card
          key={teacher.id}
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <CardHeader>
            <Avatar className="w-20 h-20 mx-auto">
              <AvatarImage
                src={teacher.avatarUrl}
                alt={teacher.name || 'Teacher'}
              />
              <AvatarFallback>{(teacher.name || 'T').charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-center mt-2">
              {teacher.name || 'Unknown Teacher'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              {teacher.bio || 'No bio available'}
            </p>
            <p className="text-sm font-semibold mb-2">
              Specializations:{' '}
              {teacher.specializations
                ? teacher.specializations.join(', ')
                : 'Not specified'}
            </p>
            <Button
              onClick={() => onSelectTeacher(teacher.id)}
              className="w-full"
              disabled={!isTeacherAvailable(teacher)}
            >
              {isTeacherAvailable(teacher) ? 'Select' : 'Not Available'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
