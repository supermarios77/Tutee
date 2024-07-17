'use client';

import { Button } from '../ui/button';
import { useNoiseCancellation } from '@stream-io/video-react-sdk';
import { MicOffIcon } from 'lucide-react';

const NoiseCancellationButton = () => {
  const { isSupported, isEnabled, setEnabled } = useNoiseCancellation();

  return (
    <Button variant="outline" size="icon" className={isEnabled ? 'bg-cyan-500 dark:bg-cyan-500' : 'bg-blue-500 dark:bg-blue-500'} onClick={() => setEnabled(!isEnabled)} disabled={!isSupported}>
      <MicOffIcon className="h-5 w-5" />
    </Button>
  );
};

export default NoiseCancellationButton;