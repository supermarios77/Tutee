'use client';

import React, { useEffect, useState } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from '@nextui-org/navbar';
import { Link } from '@nextui-org/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import NextLink from 'next/link';
import { ThemeSwitch } from '@/components/theme-switch';
import { LanguageSwitcher } from './lang-switcher';
import { SignedIn, SignedOut, useSession } from '@clerk/nextjs';
import { BookOpenIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const checkUserRole = (session: any) => {
  const roles = session?.sessionClaims?.metadata?.roles || [];
  return roles.includes('admin');
};

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
  const { session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('/student-dashboard');

  useEffect(() => {
    const adminStatus = checkUserRole(session);
    setIsAdmin(adminStatus);
    setDashboardLink(adminStatus ? '/dashboard' : '/student-dashboard');
  }, [session]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <NextUINavbar
      maxWidth="full"
      position="sticky"
      className="shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50"
    >
      <NavbarContent className="flex justify-between items-center w-full px-4">
        {/* Logo - always visible */}
        <NavbarBrand className="flex-shrink-0">
          <NextLink className="flex items-center gap-2" href="/">
            <motion.div whileHover={{ rotate: 10 }} whileTap={{ scale: 0.9 }}>
              <BookOpenIcon className="text-primary w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
            <p className="font-bold text-xl md:text-3xl text-primary notranslate">Tutee</p>
          </NextLink>
        </NavbarBrand>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-grow">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NavbarLink href={item.href}>{item.label}</NavbarLink>
            </NavbarItem>
          ))}
        </div>

        {/* Desktop and Mobile Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <ThemeSwitch />
            <LanguageSwitcher />
          </div>
          <SignedOut>
            <NavbarItem className="hidden md:flex">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="default" size="lg" className="text-lg font-semibold bg-primary/90 hover:bg-primary/100 text-white">
                  <NextLink href="/sign-up">Sign Up</NextLink>
                </Button>
              </motion.div>
            </NavbarItem>
          </SignedOut>
          <SignedIn>
            <NavbarItem className="hidden md:flex">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="default" size="lg" className="text-lg font-semibold bg-primary/90 hover:bg-primary/100 text-white">
                  <NextLink href={dashboardLink}>Dashboard</NextLink>
                </Button>
              </motion.div>
            </NavbarItem>
          </SignedIn>
          <div className="md:hidden flex items-center">
            <SignedOut>
              <Button asChild variant="default" size="sm" className="text-sm font-semibold bg-primary/90 hover:bg-primary/100 text-white mr-2">
                <NextLink href="/sign-up">Sign Up</NextLink>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="default" size="sm" className="text-sm font-semibold bg-primary/90 hover:bg-primary/100 text-white mr-2">
                <NextLink href={dashboardLink}>Dashboard</NextLink>
              </Button>
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
      </NavbarContent>

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
            </nav>
            <div className="mt-8 flex justify-center gap-4">
              <ThemeSwitch />
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NextUINavbar>
  );
};