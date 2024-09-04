import React from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from '../Dashboard/HomeCard';

const StudentMeetingTypeList = () => {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <HomeCard
        img="/assets/icons/join-meeting.svg"
        title="Join Meeting"
        description="Join your scheduled lesson"
        className="bg-blue-1 text-white"
        handleClick={() => router.push('/student-dashboard/upcoming')}
      />
      <HomeCard
        img="/assets/icons/schedule.svg"
        title="Book New Lesson"
        description="Schedule your next lesson"
        className="bg-purple-1 text-white"
        handleClick={() => router.push('/booking')}
      />
      <HomeCard
        img="/assets/icons/previous.svg"
        title="Previous Lessons"
        description="View your lesson history"
        className="bg-orange-1 text-white"
        handleClick={() => router.push('/student-dashboard/previous')}
      />
    </section>
  );
};

export default StudentMeetingTypeList;