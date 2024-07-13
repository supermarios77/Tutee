'use client';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import "@/styles/globals.css";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  StreamCall,
  StreamTheme,
  RingingCall,
  BackgroundFiltersProvider,
} from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Booking/Alert';
import MeetingSetup from '@/components/Booking/MeetingSetup';
import MeetingRoom from '@/components/Booking/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) return <Loader />;

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  // get more info about custom call type:  https://getstream.io/video/docs/react/guides/configuring-call-types/
  const notAllowed =
    call.type === 'invited' &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <BackgroundFiltersProvider
          backgroundFilter="blur" // initial filter
          backgroundImages={[
            'https://my-domain.com/bg/random-bg-1.jpg',
            'https://my-domain.com/bg/random-bg-2.jpg',
          ]}
        >
          <RingingCall />
          <StreamTheme>
            {!isSetupComplete ? (
              <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
            ) : (
              <MeetingRoom />
            )}
          </StreamTheme>
        </BackgroundFiltersProvider>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
