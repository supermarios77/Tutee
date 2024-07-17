import { MonitorIcon, MonitorPause } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const ShareScreenButton = () => {
  const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
  const { screenShare, isMute: isScreenSharing } = useScreenShareState();

  // determine, whether somebody else is sharing their screen
  const isSomeoneScreenSharing = useHasOngoingScreenShare();

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
