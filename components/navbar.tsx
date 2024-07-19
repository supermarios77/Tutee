'use client';

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from '@nextui-org/navbar';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';
import { useReducer } from 'react';
import { link as linkStyles } from '@nextui-org/theme';
import { siteConfig } from '@/config/site';
import NextLink from 'next/link';
import clsx from 'clsx';
import { ThemeSwitch } from '@/components/theme-switch';
import { LanguageSwitcher } from './lang-switcher';
import { SignedIn, SignedOut, useSession } from '@clerk/nextjs';

const checkUserRole = (session: any) => {
  return session?.sessionClaims?.metadata?.role === 'admin';
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useReducer((current) => !current, false);
  const { session } = useSession();
  const isAdmin = checkUserRole(session);

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit notranslate">Tutee</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: 'foreground' }),
                  'data-[active=true]:text-primary data-[active=true]:font-medium'
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
          <LanguageSwitcher />
          <SignedOut>
            <NavbarItem>
              <NextLink href="/sign-up">
                <Button>Sign Up</Button>
              </NextLink>
            </NavbarItem>
          </SignedOut>
          <SignedIn>
            <NavbarItem>
              <NextLink href={isAdmin ? '/dashboard' : '/student-dashboard'}>
                <Button>Dashboard</Button>
              </NextLink>
            </NavbarItem>
          </SignedIn>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <LanguageSwitcher />
        <SignedOut>
          <NavbarItem>
            <NextLink href="/sign-up">
              <Button>Sign Up</Button>
            </NextLink>
          </NavbarItem>
        </SignedOut>
        <SignedIn>
          <NavbarItem>
            <NextLink href={isAdmin ? '/dashboard' : '/student-dashboard'}>
              <Button>Dashboard</Button>
            </NextLink>
          </NavbarItem>
        </SignedIn>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? 'primary'
                    : index === siteConfig.navMenuItems.length - 1
                    ? 'danger'
                    : 'foreground'
                }
                href="/booking"
                size="lg"
                onPress={() => setIsMenuOpen()}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
