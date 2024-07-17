import { useBackgroundFilters } from '@stream-io/video-react-sdk';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Button } from '../ui/button';
import { FilterIcon } from '../icons/icons';

export const BackgroundFilter = () => {
  const {
    isSupported, // checks if these filters can run on this device
    isReady, // checks if the filters are ready to be enabled
    disableBackgroundFilter, // disables the filter
    applyBackgroundBlurFilter, // applies the blur filter
    applyBackgroundImageFilter, // applies the image filter
    backgroundImages, // list of available images
  } = useBackgroundFilters();

  if (!isSupported) {
    return <div>Background filters are not supported on this device</div>;
  }

  if (!isReady) {
    return <div className="my-loading-indicator" />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <FilterIcon className="h-5 w-5 text-black dark:text-white bg-white dark:bg-black hover:bg-gray-950" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 grid gap-2 w-64 dark:bg-black hover:bg-gray-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full" />
          <button onClick={disableBackgroundFilter}>
            Disable Background Filter
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full" />
          <button onClick={() => applyBackgroundBlurFilter('medium')}>
            Blur Background
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
