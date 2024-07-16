// app/[roomId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';
import { Chat } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Loader from '../Loader';
import EndCallButton from '../Dashboard/EndCallButton';
import { cn } from '@/lib/utils';
import { useStream } from '@/providers/StreamClientProvider';
import ChatUI from './ChatUI';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const { chatClient } = useStream();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (!chatClient) return;

    const channel = chatClient.channel('messaging', 'general', {
      name: 'General',
      image: 'https://placekitten.com/200/200',
    });

    const connectUser = async () => {
      const userToken = 'USER_TOKEN';
      const userId = 'USER_ID';
      await chatClient.connectUser(
        {
          id: userId,
          name: 'User Name',
        },
        userToken
      );
      await channel.watch();
    };

    connectUser();

    return () => {
      chatClient.disconnectUser();
    };
  }, [chatClient]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex h-full w-full">
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col w-full max-w-[1000px]">
            <CallLayout />
          </div>
        </div>
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-1/4 bg-gray-900 p-4',
            { hidden: !showParticipants }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
        <div className="absolute right-0 top-0 h-full w-1/4 bg-gray-900 p-4">
          <Chat client={chatClient} theme="team dark">
            <ChatUI /> {/* Integrate Chat UI */}
          </Chat>
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 bg-gray-800 p-4">
        <CallControls onLeave={() => router.push(`/`)} />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;