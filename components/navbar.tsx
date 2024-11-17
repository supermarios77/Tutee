'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import NextLink from 'next/link';
import { ThemeSwitch } from '@/components/theme-switch';
import { LanguageSwitcher } from './lang-switcher';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useClerk,
} from '@clerk/nextjs';
import { BookOpenIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserWithMetadata, checkUserRole } from '@/types/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavbarLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavbarLink: React.FC<NavbarLinkProps> = ({ href, children, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <NextLink
      className="text-xl font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md"
      href={href}
      onClick={onClick}
    >
      {children}
    </NextLink>
  </motion.div>
);

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { openUserProfile, signOut } = useClerk();

  const handleDashboardClick = () => {
    if (isSignedIn && user) {
      const isAdmin = checkUserRole(user as UserWithMetadata);
      const dashboardLink = isAdmin ? '/dashboard' : '/student-dashboard';
      router.push(dashboardLink);
    }
  };

  const handleProfileClick = () => {
    openUserProfile();
  };

  const handleSignOut = () => {
    signOut(() => router.push('/'));
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="sticky top-0 z-50 w-full shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - always visible */}
          <div className="flex-shrink-0">
            <NextLink className="flex items-center gap-2" href="/">
              <motion.div whileHover={{ rotate: 10 }} whileTap={{ scale: 0.9 }}>
                <BookOpenIcon className="text-primary w-8 h-8 md:w-10 md:h-10" />
              </motion.div>
              <p className="font-bold text-xl md:text-3xl text-primary notranslate">
                Tutee
              </p>
            </NextLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-grow">
            {siteConfig.navItems.map((item) => (
              <NavbarLink key={item.href} href={item.href}>
                {item.label}
              </NavbarLink>
            ))}
          </div>

          {/* Desktop and Mobile Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <ThemeSwitch />
              <LanguageSwitcher />
            </div>
            <SignedOut>
              <div className="hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="text-lg font-semibold bg-primary/90 hover:bg-primary/100 text-white"
                  >
                    <NextLink href="/sign-up">Sign Up</NextLink>
                  </Button>
                </motion.div>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: 'h-10 w-10',
                          },
                        }}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleDashboardClick}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleProfileClick}>
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SignedIn>
            <div className="md:hidden flex items-center">
              <SignedOut>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="text-sm font-semibold bg-primary/90 hover:bg-primary/100 text-white mr-2"
                >
                  <NextLink href="/sign-up">Sign Up</NextLink>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8 mr-2',
                    },
                  }}
                />
              </SignedIn>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-gray-700 dark:text-gray-300"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 md:hidden"
          >
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-gray-700 dark:text-gray-300"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="mt-8">
              {siteConfig.navItems.map((item) => (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NavbarLink href={item.href} onClick={toggleMobileMenu}>
                    {item.label}
                  </NavbarLink>
                </motion.div>
              ))}
              <SignedIn>
                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <NavbarLink
                    href="#"
                    onClick={() => {
                      handleDashboardClick();
                      toggleMobileMenu();
                    }}
                  >
                    Dashboard
                  </NavbarLink>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <NavbarLink
                    href="#"
                    onClick={() => {
                      handleProfileClick();
                      toggleMobileMenu();
                    }}
                  >
                    Account
                  </NavbarLink>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <NavbarLink
                    href="#"
                    onClick={() => {
                      handleSignOut();
                      toggleMobileMenu();
                    }}
                  >
                    Sign out
                  </NavbarLink>
                </motion.div>
              </SignedIn>
            </nav>
            <div className="mt-8 flex justify-center gap-4">
              <ThemeSwitch />
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
