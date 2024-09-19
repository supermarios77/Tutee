import React from 'react';
import { Teacher } from '@/types/booking';

interface SelectTeacherProps {
  teachers: Teacher[];
  onSelectTeacher: (teacherId: string) => void;
}

export const SelectTeacher: React.FC<SelectTeacherProps> = ({ teachers, onSelectTeacher }) => {
  if (!Array.isArray(teachers) || teachers.length === 0) {
    return <div className="text-center py-4">No teachers available at the moment.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachers.map((teacher) => (
        <option key={teacher.id} value={teacher.id}>
          {teacher.firstName} {teacher.lastName}
        </option>
      ))}
    </div>
  );
};