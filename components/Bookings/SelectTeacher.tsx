import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Teacher } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logger from '@/lib/logger';

interface SelectTeacherProps {
  onSelectTeacher: (teacher: Teacher) => void;
  selectedPlan: string;
}

export const SelectTeacher: React.FC<SelectTeacherProps> = ({ onSelectTeacher, selectedPlan }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
        const querySnapshot = await getDocs(teachersQuery);
        
        if (querySnapshot.empty) {
          logger.warn('No teachers found in the database');
          setError('No teachers available at the moment.');
          setIsLoading(false);
          return;
        }

        const teachersData = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
          const userData = docSnapshot.data();
          const availableSlotsRef = collection(db, 'availableSlots');
          const availableSlotsQuery = query(availableSlotsRef, where('teacherId', '==', docSnapshot.id));
          const availableSlotsSnapshot = await getDocs(availableSlotsQuery);
          
          const availableSlots = availableSlotsSnapshot.empty ? [] : availableSlotsSnapshot.docs[0].data().slots;
          
          return {
            id: docSnapshot.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            avatarUrl: userData.imageUrl,
            bio: userData.bio || 'No bio available',
            specializations: userData.specializations || [],
            availableSlots: availableSlots
          } as Teacher;
        }));
        
        setTeachers(teachersData);
      } catch (error) {
        logger.error('Error fetching teachers:', error);
        setError(`Failed to fetch teachers. Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (isLoading) {
    return <div>Loading teachers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachers.map((teacher) => (
        <Card key={teacher.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <Avatar className="w-20 h-20 mx-auto">
              <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-center mt-2">{teacher.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{teacher.bio}</p>
            <p className="text-sm font-semibold mb-2">
              Specializations: {teacher.specializations.length > 0 ? teacher.specializations.join(', ') : 'Not specified'}
            </p>
            <Button 
              onClick={() => onSelectTeacher(teacher)} 
              className="w-full"
            >
              Select
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};