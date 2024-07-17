import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { CameraIcon } from '../icons/icons';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { CameraOffIcon } from 'lucide-react';

const CameraButton: React.FC = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  const [isCameraOn, setIsCameraOn] = useState(!isMute);

  useEffect(() => {
    setIsCameraOn(!isMute);
  }, [isMute]);

  const handleToggleCamera = () => {
    camera.toggle();
    setIsCameraOn(!isCameraOn);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleCamera}
      className={isCameraOn ? 'bg-green-500 dark:bg-greeb-500' : 'bg-red-500 dark:bg-red-500'}
    >
      {isCameraOn ? (
        <CameraIcon className="h-5 w-5" />
      ) : (
        <CameraOffIcon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default CameraButton;