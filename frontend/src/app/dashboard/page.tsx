"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, loading: roleLoading } = useUserRole();
  const [session, setSession] = useState<{ user?: { email?: string; name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a session token from OAuth redirect (localhost development workaround)
        const sessionToken = searchParams.get("_session_token");
        
        if (sessionToken) {
          // For localhost development, establish the session by calling our API route
          // This sets the cookie on the frontend domain server-side
          try {
            const response = await fetch(`/api/auth/establish-session?token=${encodeURIComponent(sessionToken)}`, {
              method: "GET",
              credentials: "include",
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Store token in localStorage for future requests to auth-service
              if (data.token) {
                localStorage.setItem("auth_session_token", data.token);
              }
              
              // If we got session data, use it directly
              // The session structure from Better Auth is: { data: { session: {...}, user: {...} } }
              if (data.session && data.session.data) {
                // Better Auth format: { data: { session: {...}, user: {...} } }
                const sessionData = data.session.data;
                if (sessionData.session || sessionData.user) {
                  setSession(sessionData);
                  setLoading(false);
                  
                  // Remove token from URL
                  const urlParams = new URLSearchParams(window.location.search);
                  urlParams.delete("_session_token");
                  const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
                  window.history.replaceState({}, "", newUrl);
                  return; // Exit early since we have the session
                }
              } else if (data.session && (data.session.session || data.session.user)) {
                // Alternative format: { session: {...}, user: {...} }
                setSession(data.session);
                setLoading(false);
                
                // Remove token from URL
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.delete("_session_token");
                const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
                window.history.replaceState({}, "", newUrl);
                return; // Exit early since we have the session
              } else if (data.session === null && data.token) {
                // Session is null but we have a token - try to fetch session directly with the token
                // Continue to the next part of the code to fetch session with token
              }
              
              // Remove token from URL even if we didn't get session data
              const urlParams = new URLSearchParams(window.location.search);
              urlParams.delete("_session_token");
              const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
              window.history.replaceState({}, "", newUrl);
            }
          } catch (tokenError) {
            // Silently handle errors
          }
        }
        
        // Try to get session - Better Auth client will fetch from auth-service
        // For OAuth flows, the session might take a moment to be available
        // Note: The cookie set on frontend domain won't be sent to auth-service (different origin)
        // So we need to manually fetch with the token if we have it stored
        let sessionResult = null;
        
        // Check if we have a stored token from localStorage or URL
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth_session_token") : null;
        const urlToken = searchParams.get("_session_token");
        const remainingToken = urlToken || storedToken;
        
        if (remainingToken) {
          try {
            // Decode the token if it's URL-encoded
            let decodedToken = remainingToken;
            try {
              decodedToken = decodeURIComponent(remainingToken);
            } catch {
              // If decoding fails, use the original token
            }
            
            const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001";
            const directResponse = await fetch(`${authServiceUrl}/api/auth/get-session`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Cookie": `better-auth.session_token=${decodedToken}`,
              },
            });
            
            if (directResponse.ok) {
              const directData = await directResponse.json();
              if (directData?.data?.session) {
                sessionResult = directData;
              }
            }
          } catch (directError) {
            // Silently handle errors
          }
        }
        
        // If direct fetch didn't work, try Better Auth client
        if (!sessionResult || !sessionResult.data?.session) {
          try {
            sessionResult = await authClient.getSession();
          } catch (clientError) {
            sessionResult = null;
          }
        }
        
        // If no session immediately, retry a few times (OAuth callback might be processing)
        if (!sessionResult || !sessionResult.data?.session) {
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
              // Try with stored token first
              if (storedToken && !sessionResult?.data?.session) {
                const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001";
                const retryResponse = await fetch(`${authServiceUrl}/api/auth/get-session`, {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    "Cookie": `better-auth.session_token=${storedToken}`,
                  },
                });
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json();
                  if (retryData?.data?.session) {
                    sessionResult = retryData;
                    break;
                  }
                }
              }
              
              // Fallback to Better Auth client
              if (!sessionResult?.data?.session) {
                sessionResult = await authClient.getSession();
                if (sessionResult?.data?.session) {
                  break;
                }
              }
            } catch (retryError) {
              // Silently handle retry errors
            }
          }
        }
        
        if (!sessionResult || !sessionResult.data?.session) {
          router.push("/login?error=session_not_found");
          return;
        }
        
        setSession(sessionResult.data);
        setLoading(false);
      } catch (error) {
        router.push("/login?error=session_error");
      }
    };

    checkSession();
  }, [router, searchParams]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome to Your Portfolio
              </h1>
              <p className="text-muted-foreground">
                {session?.user?.email} • Role: <span className="font-semibold">{role || "CUSTOMER"}</span>
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-muted-foreground mb-4">
              You have successfully logged in to your portfolio website.
            </p>
            {role === "ADMIN" && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-semibold text-primary">
                  Admin Access: You have full administrative privileges.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                View Profile
              </Button>
              <Button className="w-full" variant="outline">
                Edit Settings
              </Button>
              {role === "ADMIN" && (
                <Button 
                  className="w-full" 
                  onClick={() => router.push("/admin")}
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Your Account</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{session?.user?.name || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{role || "CUSTOMER"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8 bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold mb-4">Your Portfolio</h2>
          <p className="text-muted-foreground">
            This is your dashboard. You can customize this page to show your portfolio items,
            projects, and other content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
