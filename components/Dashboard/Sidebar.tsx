'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, Settings, LogOut } from 'lucide-react';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function SidebarContent({ isMobile = false, isExpanded = true, onLinkClick = () => {} }) {
  const pathname = usePathname();

  const memoizedLinks = useMemo(() => sidebarLinks.map((item) => {
    const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
    
    return (
      <TooltipProvider key={item.label}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.route}
              className={cn(
                'flex items-center p-4 rounded-lg transition-colors',
                isActive ? 'bg-blue-1' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                isExpanded ? 'justify-start' : 'justify-center'
              )}
              onClick={onLinkClick}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={24}
                height={24}
              />
              {(isExpanded || isMobile) && (
                <p className="text-lg font-semibold ml-4">
                  {item.label}
                </p>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className={isExpanded ? 'hidden' : ''}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }), [pathname, isExpanded, isMobile, onLinkClick]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {memoizedLinks}
    </div>
  );
}

function UserProfile({ isExpanded }: { isExpanded: boolean }) {
  const { user } = useUser();

  return (
    <SignedIn>
      <div className={cn(
        "flex items-center gap-4 p-4",
        isExpanded ? "justify-start" : "justify-center"
      )}>
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10"
            }
          }}
        />
        {isExpanded && user && (
          <div className="flex flex-col">
            <p className="text-sm font-medium">{user.fullName || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.primaryEmailAddress?.emailAddress || ''}</p>
          </div>
        )}
      </div>
    </SignedIn>
  );
}

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 sm:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-white dark:bg-black">
          <nav className="flex flex-col h-full p-6 pt-28">
            <SidebarContent isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
            <UserProfile isExpanded={true} />
          </nav>
        </SheetContent>
      </Sheet>

      <section className={cn(
        "sticky left-0 top-0 flex h-screen flex-col bg-white text-black justify-between dark:bg-black dark:text-white p-6 pt-28 max-sm:hidden",
        isExpanded ? "w-[264px]" : "w-[88px]"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-4"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
        <SidebarContent isExpanded={isExpanded} />
        <UserProfile isExpanded={isExpanded} />
      </section>
    </>
  );
}