import {
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from '../Dashboard/Alert';
import MicButton from '../Buttons/MicButton';
import CameraButton from '../Buttons/CameraButton';
import { BackgroundFilter } from '../Buttons/BGFilterButton';
import { Button } from '../ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/assets/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center order-2 md:order-1">
            <div className="w-full md:w-[800px] h-auto bg-muted rounded-xl overflow-hidden flex items-center justify-center">
              <VideoPreview />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <MicButton />
              <CameraButton />
              <BackgroundFilter />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 order-1 md:order-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Join the Call
            </h1>
            <p className="text-muted-foreground max-w-md text-center">
              Adjust your camera, microphone, and background before joining the
              call.
            </p>
            <Button
              size="lg"
              className="w-full max-w-xs"
              onClick={() => {
                call.join();

                setIsSetupComplete(true);
              }}
            >
              Join Call
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingSetup;
