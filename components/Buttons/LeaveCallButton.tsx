import { useCall } from '@stream-io/video-react-sdk';
import { Button } from '../ui/button';
import { PhoneIcon } from 'lucide-react';

const LeaveCall: React.FC = () => {
  const call = useCall();

  return (
    <Button variant="destructive" size="icon" onClick={() => call?.leave()}>
      <PhoneIcon className="h-5 w-5" />
    </Button>
  );
};

export default LeaveCall;
