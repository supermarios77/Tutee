import Link from 'next/link';
import UserManagement from '@/components/Dashboard/UserManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UserManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/admin-dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      <UserManagement />
    </div>
  );
}