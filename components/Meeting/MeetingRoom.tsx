import React, { useState, useEffect } from 'react';
import {
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import useSound from 'use-sound';
import { cn } from '@/lib/utils';
import Loader from '@/components/Loader';
import { InvitePopup } from '@/components/InvitePanel/InvitePanel';
import CallControls from './CallControls';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom: React.FC = () => {
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useScreenShareState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const call = useCall();
  const callId = call?.id || '';
  const { status: screenShareStatus, mediaStream: screenShareMediaStream } =
    useScreenShareState();

  const [playJoinSound] = useSound('/assets/audio/join.mp3');
  const [playLeaveSound] = useSound('/assets/audio/leave.mp3');

  useEffect(() => {
    if (!call) return;

    const handleParticipantJoin = () => {
      playJoinSound();
    };

    const handleParticipantLeave = () => {
      playLeaveSound();
    };

    call.on('call.session_participant_joined', handleParticipantJoin);
    call.on('call.session_participant_left', handleParticipantLeave);

    return () => {
      call.off('call.session_participant_joined', handleParticipantJoin);
      call.off('call.session_participant_left', handleParticipantLeave);
    };
  }, [call, playJoinSound, playLeaveSound]);

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      setShowInvitePopup(true);
    }
  }, [callingState]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isScreenSharing = screenShareStatus === 'enabled';

  const CallLayout = () => {
    if (isScreenSharing && screenShareMediaStream) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-grow relative">
            <video
              ref={(node) => {
                if (node) node.srcObject = screenShareMediaStream;
              }}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          <div className="h-1/4">
            <PaginatedGridLayout />
          </div>
        </div>
      );
    }

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
      {showInvitePopup && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <InvitePopup
            callId={callId}
            close={() => setShowInvitePopup(false)}
          />
        </div>
      )}
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
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
      </div>
    </section>
  );
};

export default MeetingRoom;
