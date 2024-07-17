import type { CallControlsProps } from '@stream-io/video-react-sdk';
import { BackgroundFilter } from '../Buttons/BGFilterButton';
import MicButton from '../Buttons/MicButton';
import CameraButton from '../Buttons/CameraButton';
import LeaveCall from '../Buttons/LeaveCallButton';
import ShareScreenButton from '../Buttons/ShareScreenButton';
import NoiseCancellationButton from '../Buttons/NoiseCancellationButton';

const CallControls = () => {
  return (
    <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 mb-5">
      <BackgroundFilter />
      <MicButton />
      <CameraButton />
      <LeaveCall />
      <ShareScreenButton />
      <NoiseCancellationButton />
    </div>
  );
};

export default CallControls;
