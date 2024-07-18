import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Dashboard/Navbar';
import StudentSidebar from '@/components/Dashboard/StudentSidebar';

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative">
      <Navbar />

      <div className="flex">
        <StudentSidebar />
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
