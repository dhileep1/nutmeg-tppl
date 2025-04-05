
import React from 'react';
import { UserManagement } from '@/components/UserManagement';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCog } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <UserCog className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <UserManagement />
    </div>
  );
}
