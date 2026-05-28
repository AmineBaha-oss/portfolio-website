"use client";

import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { authorized, loading } = useAdminAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 text-white">Admin Dashboard</h1>
          <p className="text-white/60 text-lg">Welcome back, Amine.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/8 transition-all">
            <h2 className="text-2xl font-bold mb-4 text-white">Admin Functions</h2>
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
      </div>
    </div>
  );
}
