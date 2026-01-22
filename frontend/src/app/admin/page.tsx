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
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
          <p className="text-white/60 mb-8">
            You do not have ADMIN role to access this page.
          </p>
          <Button 
            onClick={() => window.location.href = "/login"}
            className="bg-white text-black hover:bg-white/90 px-8 py-6"
          >
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
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 text-white">Admin Dashboard</h1>
          <p className="text-white/60 text-lg">
            Welcome, Admin! Your role: <span className="font-semibold text-white">{role}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/8 transition-all">
            <h2 className="text-2xl font-bold mb-4 text-white">Admin Functions</h2>
            <p className="text-white/70 mb-4">
              You have full admin access. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>Edit portfolio content</li>
              <li>Add new projects and skills</li>
              <li>Manage testimonials</li>
              <li>Configure site settings</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/8 transition-all">
            <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full bg-white text-black hover:bg-white/90 py-6 font-semibold">
                Add New Item
              </Button>
              <Button 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 py-6" 
                variant="outline"
              >
                Manage Users
              </Button>
              <Button 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 py-6" 
                variant="outline"
              >
                View Settings
              </Button>
              <Button 
                className="w-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 py-6" 
                variant="destructive" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/8 transition-all">
          <h2 className="text-2xl font-bold mb-4 text-white">Example API Call</h2>
          <p className="text-white/70 mb-4">
            Test admin-only API endpoint:
          </p>
          <Button
            className="bg-white text-black hover:bg-white/90 px-8 py-6 font-semibold"
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
