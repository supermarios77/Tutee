/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
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
} from '@stream-io/video-react-sdk';
import {
  MicIcon,
  VideoIcon,
  CloudyIcon,
  PhoneIcon,
} from '../icons/icons';
import { CameraOffIcon, MicOffIcon } from 'lucide-react';
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

  useEffect(() => {
    setIsMicOn(!isMicMute);
  }, [isMicMute]);

  useEffect(() => {
    setIsCameraOn(!isCameraMute);
  }, [isCameraMute]);

  const handleToggleMicrophone = () => {
    microphone.toggle();
    play()
    setIsMicOn(!isMicOn);
  };

  const handleToggleCamera = () => {
    camera.toggle();
    play()
    setIsCameraOn(!isCameraOn);
  };

  const handleToggleBackgroundBlur = () => {
    if (isBGSupported && isBGReady) {
      if (isBGBlurred) {
        disableBackgroundFilter();
        play()
      } else {
        applyBackgroundBlurFilter('medium');
        play()
      }
      setIsBGBlurred(!isBGBlurred);
    }
  };

  const handleEndCall = () => {
    call?.leave();
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="bg-background/80 backdrop-blur-sm backdrop-filter backdrop-blur-lg rounded-3xl py-3 px-6 flex items-center justify-between shadow-xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground"
                onClick={handleToggleMicrophone}
              >
                {isMicOn ? (
                  <MicIcon className="w-6 h-6" />
                ) : (
                  <MicOffIcon className="w-6 h-6 " />
                )}
                <span className="sr-only">Mute</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>Mute</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground"
                onClick={handleToggleCamera}
              >
                {isCameraOn ? (
                  <VideoIcon className="w-6 h-6" />
                ) : (
                  <CameraOffIcon className="w-6 h-6" />
                )}
                <span className="sr-only">Camera</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>Camera</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ShareScreenButton />
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>Share Screen</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground"
                onClick={handleToggleBackgroundBlur}
                disabled={!isBGSupported || !isBGReady}
              >
                <CloudyIcon className="w-6 h-6" />
                <span className="sr-only">Background Blur</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>Background Blur</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="w-12 h-12 rounded-full text-foreground bg-red-700 hover:bg-red-600"
                onClick={handleEndCall}
              >
                <PhoneIcon className="w-6 h-6" />
                <span className="sr-only">End Call</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-foreground">
              <p>End Call</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}