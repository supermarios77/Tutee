'use client';
import { useState, useEffect } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';

import Loader from '../Loader';
import { cn } from '@/lib/utils';
import CallControls from './CallControls';

import { InvitePanel, InvitePopup } from '../InvitePanel/InvitePanel';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callId = call?.id || '';

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      setShowInvitePopup(true);
    }
  }, [callingState]);

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
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <CallControls />
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
        {showInvitePopup && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
            <InvitePopup
              callId={callId}
              close={() => setShowInvitePopup(false)}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MeetingRoom;