'use client';

import React, { useMemo } from 'react';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import '@/styles/globals.css';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  StreamCall,
  StreamTheme,
  BackgroundFiltersProvider,
  NoiseCancellationProvider,
} from '@stream-io/video-react-sdk';
import { NoiseCancellation } from '@stream-io/audio-filters-web';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Dashboard/Alert';
import MeetingSetup from '@/components/Meeting/MeetingSetup';
import MeetingRoom from '@/components/Meeting/MeetingRoom';

const MeetingPage: React.FC = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const noiseCancellation = useMemo(() => new NoiseCancellation(), []);

  if (!isLoaded || isCallLoading) return <Loader />;

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  const notAllowed =
    call.type === 'invited' &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call as any}>
        <NoiseCancellationProvider noiseCancellation={noiseCancellation}>
          <BackgroundFiltersProvider
            backgroundImages={[
              'https://my-domain.com/bg/random-bg-1.jpg',
              'https://my-domain.com/bg/random-bg-2.jpg',
            ]}
          >
            <StreamTheme>
              {!isSetupComplete ? (
                <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
              ) : (
                <MeetingRoom />
              )}
            </StreamTheme>
          </BackgroundFiltersProvider>
        </NoiseCancellationProvider>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;