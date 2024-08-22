'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  Call,
  StreamTheme,
  BackgroundFiltersProvider,
} from '@stream-io/video-react-sdk';
import { Loader } from 'lucide-react';

import Alert from '@/components/Dashboard/Alert';
import MeetingRoom from '@/components/Meeting/MeetingRoom';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import '@/styles/globals.css';

const MeetingPage: React.FC = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = useCallback(async () => {
    if (!user) return;

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
      setError('Stream API key is not defined');
      return;
    }

    try {
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userName: user.fullName || user.username || user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Stream token');
      }

      const { token } = await response.json();

      const clientInstance = new StreamVideoClient({
        apiKey,
        user: {
          id: user.id,
          name: user.fullName || user.username || user.id,
        },
        token,
      });

      setClient(clientInstance);
    } catch (error) {
      console.error('Error initializing Stream client:', error);
      setError('Failed to initialize video call');
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      initializeClient();
    }
  }, [isLoaded, user, initializeClient]);

  useEffect(() => {
    if (!client || !id) return;

    const callInstance = client.call('default', id as string);
    setCall(callInstance);

    const joinCall = async () => {
      try {
        await callInstance.join({ create: true });
        console.log('Call joined successfully');
      } catch (error) {
        console.error('Error joining call:', error);
        if (error instanceof Error && !error.message.includes('Already joined')) {
          setError('Failed to join call. Please try again.');
        }
      }
    };

    joinCall();

    return () => {
      if (callInstance.state.callingState === 'joined') {
        callInstance.leave().catch(console.error);
      }
    };
  }, [client, id]);

  if (!isLoaded || !client || !call) return <Loader />;

  if (error) {
    return <Alert title={error} />;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <BackgroundFiltersProvider
          backgroundImages={[
            'https://tutee.co.uk/bg/random-bg-1.jpg',
            'https://tutee.co.uk/bg/random-bg-2.jpg',
          ]}
        >
          <StreamTheme>
            <MeetingRoom />
          </StreamTheme>
        </BackgroundFiltersProvider>
      </StreamCall>
    </StreamVideo>
  );
};

export default MeetingPage;