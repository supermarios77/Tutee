import { Metadata } from 'next';
import { ReactNode } from 'react';
import StudentSidebar from '@/components/Dashboard/StudentSidebar';

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

export default function RootLayout({ children }: Readonly<{children: ReactNode}>) {
  return (

      <main className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0A0A1B] text-gray-900 dark:text-white transition-colors duration-300">
        <StudentSidebar />
        <section className="flex-1 overflow-y-auto">
          {children}
        </section>
      </main>

  );
}