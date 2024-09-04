'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { Home, Calendar, BookOpen, Clock, UserCircle2, Menu, ChevronRight } from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sidebarLinks = [
  { icon: Home, route: '/student-dashboard', label: 'Home' },
  { icon: Calendar, route: '/student-dashboard/upcoming', label: 'Upcoming Lessons' },
  { icon: BookOpen, route: '/booking', label: 'Book Lesson' },
  { icon: Clock, route: '/student-dashboard/previous', label: 'Previous Lessons' },
  { icon: UserCircle2, route: '/join-meeting', label: 'Join Meeting' },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useUser();

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="flex items-center justify-between mb-6">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>
      <nav className="space-y-1">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TooltipProvider key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.route}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                    {(isExpanded || isMobile) && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className={isExpanded ? 'hidden' : ''}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        <SignedIn>
          <div className={`flex items-center gap-3 rounded-lg bg-muted p-3 ${isExpanded ? '' : 'justify-center'}`}>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
            {(isExpanded || isMobile) && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName || 'Student'}</span>
                <span className="text-xs text-muted-foreground">Manage Account</span>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </>
  );

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full p-6">
            <SidebarContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className={`hidden md:flex flex-col h-screen bg-background border-r transition-all duration-300 ${isExpanded ? 'w-64' : 'w-[70px]'}`}>
        <div className="flex flex-col h-full p-4">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}