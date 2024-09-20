import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, DollarSign, Settings, HelpCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/user-management">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/lesson-management">
              <BookOpen className="mr-2 h-4 w-4" />
              Lesson Management
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/financial-overview">
              <DollarSign className="mr-2 h-4 w-4" />
              Financial Overview
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/support">
              <HelpCircle className="mr-2 h-4 w-4" />
              Support Dashboard
            </Link>
          </Button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
        {/* Add dashboard summary components here */}
        <p>Add summary cards, charts, or other relevant information for the admin dashboard overview.</p>
      </section>
    </div>
  );
}