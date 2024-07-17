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
      variant="outline"
      size="icon"
      disabled={!isScreenSharing && isSomeoneScreenSharing}
      onClick={() => screenShare.toggle()}
      className='bg-[#ffaa00] hover:bg-[#ffbc35]'
    >
      {isScreenSharing ? (
        <MonitorIcon className="h-5 w-5 text-white" />
      ) : (
        <MonitorPause className="h-5 w-5 text-white" />
      )}
    </Button>
  );
};

export default ShareScreenButton;
