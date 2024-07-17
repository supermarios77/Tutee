import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { MicIcon } from '../icons/icons';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { MicOffIcon } from 'lucide-react';

const MicButton: React.FC = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const [isMicOn, setIsMicOn] = useState(!isMute);

  useEffect(() => {
    setIsMicOn(!isMute);
  }, [isMute]);

  const handleToggleMicrophone = () => {
    microphone.toggle();
    setIsMicOn(!isMicOn);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleMicrophone}
      className={isMicOn ? 'bg-green-500 dark:bg-green-500' : 'bg-red-500 dark:bg-red-500'}
    >
      {isMicOn ? (
        <MicIcon className="h-5 w-5" />
      ) : (
        <MicOffIcon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default MicButton;