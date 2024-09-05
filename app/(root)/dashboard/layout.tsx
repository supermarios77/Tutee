import { Metadata } from 'next';
import { ReactNode } from 'react';

import Sidebar from '@/components/Dashboard/Sidebar';

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Teacher Dashboard',
};

const DashboardLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative">
      <div className="flex">
        <Sidebar />
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default DashboardLayout;