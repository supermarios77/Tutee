import { MonitorIcon, MonitorPause } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

const ShareScreenButton = () => {
  const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
  const { screenShare, isMute: isScreenSharing } = useScreenShareState();
  const call = useCall();

  // determine, whether somebody else is sharing their screen
  const isSomeoneScreenSharing = useHasOngoingScreenShare();

  call?.screenShare.setSettings({
    maxFramerate: 15, // will be clamped between 1 and 15 fps
    maxBitrate: 1500000, // will use at most 1.5Mbps
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!isScreenSharing && isSomeoneScreenSharing}
      onClick={() => screenShare.toggle()}
      className="w-12 h-12 rounded-full text-foreground"
    >
      {isScreenSharing ? (
        <MonitorIcon className="h-5 w-5" />
      ) : (
        <MonitorPause className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ShareScreenButton;
