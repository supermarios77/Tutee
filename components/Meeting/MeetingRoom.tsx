import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  useCall,
  useCallStateHooks,
  useBackgroundFilters,
  CallingState,
  StreamVideoEvent
} from '@stream-io/video-react-sdk';
import {
  MicIcon,
  VideoIcon,
  CloudyIcon,
  PhoneIcon,
} from '../icons/icons';
import { CameraOffIcon, MicOffIcon, Users } from 'lucide-react';
import ShareScreenButton from '../Buttons/ShareScreenButton';
import useSound from "use-sound";
import soundFile from "/public/assets/audio/mouse-click.mp3";

export default function CallControls() {
  const call = useCall();
  const {
    useCameraState,
    useMicrophoneState,
  } = useCallStateHooks();
  const { camera, isMute: isCameraMute } = useCameraState();
  const { microphone, isMute: isMicMute } = useMicrophoneState();
  const {
    isSupported: isBGSupported,
    isReady: isBGReady,
    disableBackgroundFilter,
    applyBackgroundBlurFilter,
  } = useBackgroundFilters();
  const [isMicOn, setIsMicOn] = useState(!isMicMute);
  const [isCameraOn, setIsCameraOn] = useState(!isCameraMute);
  const [isBGBlurred, setIsBGBlurred] = useState(false);
  const [play] = useSound(soundFile);

  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMicOn(!isMicMute);
  }, [isMicMute]);

  useEffect(() => {
    setIsCameraOn(!isCameraMute);
  }, [isCameraMute]);

  const handleToggleMicrophone = () => {
    microphone.toggle();
    play();
    setIsMicOn(!isMicOn);
  };

  const handleToggleCamera = () => {
    camera.toggle();
    play();
    setIsCameraOn(!isCameraOn);
  };

  const handleToggleBackgroundBlur = () => {
    if (isBGSupported && isBGReady) {
      if (isBGBlurred) {
        disableBackgroundFilter();
        play();
      } else {
        applyBackgroundBlurFilter('medium');
        play();
      }
      setIsBGBlurred(!isBGBlurred);
    }
  };

  const handleEndCall = () => {
    call?.leave();
  };

  const handleEndCallForEveryone = async () => {
    try {
      await call?.endCall();
      play();
    } catch (error) {
      console.error('Failed to end call for everyone:', error);
    }
  };

  const reconnectToCall = useCallback(async () => {
    if (call && !isReconnecting) {
      setIsReconnecting(true);
      try {
        await call.join();
        console.log('Successfully reconnected to the call');
        setIsReconnecting(false);
      } catch (error) {
        console.error('Failed to reconnect to the call:', error);
        // Attempt to reconnect again after a delay
        reconnectTimeoutRef.current = setTimeout(reconnectToCall, 5000);
      }
    }
  }, [call, isReconnecting]);

  useEffect(() => {
    const handleConnectionStateChanged = (event: StreamVideoEvent) => {
      if (event.type === 'connectionStateChanged') {
        const { newState } = event;
        console.log('Connection state changed:', newState);
        if (newState === 'disconnected' || newState === 'closed') {
          reconnectToCall();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && call && call.state.callingState !== CallingState.JOINED) {
        reconnectToCall();
      }
    };

    const handleOnline = () => {
      if (call && call.state.callingState !== CallingState.JOINED) {
        reconnectToCall();
      }
    };

    if (call) {
      call.on('connectionStateChanged', handleConnectionStateChanged);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      if (call) {
        call.off('connectionStateChanged', handleConnectionStateChanged);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [call, reconnectToCall]);

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="bg-background/80 backdrop-blur-lg backdrop-filter rounded-3xl py-3 px-6 flex items-center justify-between shadow-xl">
          {/* Existing buttons... */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground bg-red-700 hover:bg-red-600"
                onClick={handleEndCall}
              >
                <PhoneIcon className="w-6 h-6" />
                <span className="sr-only">Leave Call</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>Leave Call</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground bg-red-800 hover:bg-red-700"
                onClick={handleEndCallForEveryone}
              >
                <Users className="w-6 h-6" />
                <span className="sr-only">End Call for Everyone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>End Call for Everyone</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}