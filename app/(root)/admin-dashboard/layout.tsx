import RoleCheck from '@/components/Dashboard/RoleCheck';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleCheck allowedRoles={['admin']}>{children}</RoleCheck>;
}
