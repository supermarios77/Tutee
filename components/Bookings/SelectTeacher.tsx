// app/components/booking/SelectTeacher.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Teacher } from '../../types/booking';

interface SelectTeacherProps {
  teachers: Teacher[];
  selectedTeacher: string | undefined;
  onSelectTeacher: (teacherId: string) => void;
}

export const SelectTeacher: React.FC<SelectTeacherProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Teacher</h2>
      <Select onValueChange={onSelectTeacher} value={selectedTeacher}>
        <SelectTrigger>
          <SelectValue placeholder="Choose your teacher" />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};