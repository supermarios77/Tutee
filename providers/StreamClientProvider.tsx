'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

interface StreamContextType {
  videoClient: StreamVideoClient | null;
  chatClient: StreamChat | null;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

const StreamProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user || !API_KEY) return;

    const chatClient = StreamChat.getInstance(API_KEY);
    chatClient.connectUser(
      {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider
    );
    setChatClient(chatClient);

    const videoClient = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });

    setVideoClient(videoClient);

    return () => {
      chatClient.disconnectUser();
      setVideoClient(null);
      setChatClient(null);
    };
  }, [user, isLoaded]);

  if (!videoClient || !chatClient) return <Loader />;

  return (
    <StreamContext.Provider value={{ videoClient, chatClient }}>
      <StreamVideo client={videoClient}>{children}</StreamVideo>
    </StreamContext.Provider>
  );
};

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};

export default StreamProvider;