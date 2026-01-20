"use client";

import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { authorized, loading: adminLoading } = useAdminAccess();
  const { role, loading: roleLoading } = useUserRole();

  if (adminLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You do not have ADMIN role to access this page.
          </p>
          <Button onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, Admin! Your role: <span className="font-semibold">{role}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Admin Functions</h2>
            <p className="text-muted-foreground mb-4">
              You have full admin access. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Edit content</li>
              <li>Add new items</li>
              <li>Manage users</li>
              <li>Configure settings</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full">Add New Item</Button>
              <Button className="w-full" variant="outline">Manage Users</Button>
              <Button className="w-full" variant="outline">View Settings</Button>
              <Button className="w-full" variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold mb-4">Example API Call</h2>
          <p className="text-muted-foreground mb-4">
            Test admin-only API endpoint:
          </p>
          <Button
            onClick={async () => {
              try {
                const tokenResult = await authClient.token();
                const token = tokenResult.data?.token;
                
                if (!token) {
                  alert("No token available");
                  return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
                const response = await fetch(`${apiUrl}/api/admin/example`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                const data = await response.json();
                alert(JSON.stringify(data, null, 2));
              } catch (error) {
                alert("Error: " + (error as Error).message);
              }
            }}
          >
            Test Admin API
          </Button>
        </div>
      </div>
    </div>
  );
}
