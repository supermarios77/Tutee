'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const StudentSidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col bg-white text-black justify-between  dark:bg-black p-6 pt-28 dark:text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
            <Link
              href="/student-dashboard/upcoming"
              key="Upcoming"
              className={cn(
                'flex gap-4 items-center p-4 rounded-lg justify-start',
              )}
            >
              <Image
                src='/assets/icons/upcoming.svg'
                alt="Upcoming"
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                Upcoming
              </p>
            </Link>
      </div>
    </section>
  );
};

export default StudentSidebar;