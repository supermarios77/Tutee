import React from 'react';

interface Teacher {
  id: string;
  name: string;
  // Add any additional fields from Firebase here
}

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
        <div
          key={teacher.id}
          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
          onClick={() => onSelectTeacher(teacher.id)}
        >
          <h3 className="text-lg font-semibold">{teacher.name}</h3>
          {/* Add any additional teacher information here */}
        </div>
      ))}
    </div>
  );
};