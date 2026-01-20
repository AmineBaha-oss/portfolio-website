"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role?: string;
  [key: string]: unknown;
}

/**
 * Custom hook to check if the current user has ADMIN role.
 * Redirects to login if not authenticated or not an admin.
 * 
 * @returns { authorized: boolean, loading: boolean }
 */
export function useAdminAccess() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cache token to avoid calling authClient.token() multiple times
    let cachedToken: string | null = null;

    const extractRoleFromToken = async (): Promise<string | null> => {
      try {
        if (!cachedToken) {
          const tokenResult = await authClient.token();
          cachedToken = tokenResult.data?.token || null;
        }
        if (!cachedToken) {
          return null;
        }
        const payload = jwtDecode<JwtPayload>(cachedToken);
        return payload.role || null;
      } catch {
        // Silently handle token errors
        return null;
      }
    };

    const fetchRoleFromApi = async (userId: string): Promise<string | null> => {
      try {
        const authApiBase = getAuthServiceBaseUrl();
        // Role endpoint uses cookie-based authentication via credentials: "include"
        const roleResponse = await fetch(`${authApiBase}/api/auth/users/${userId}/role`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          return roleData.role || null;
        }
      } catch {
        // Silently handle API errors
      }
      return null;
    };

    const getUserRole = async (user: { id?: string; role?: string } | undefined): Promise<string | null> => {
      // First try session role
      let role: string | null = user?.role || null;
      if (role) {
        return role;
      }

      // Then try JWT token
      role = await extractRoleFromToken();
      if (role) {
        return role;
      }

      // Finally try API
      if (user?.id) {
        role = await fetchRoleFromApi(user.id);
        if (role) {
          return role;
        }
      }

      return null;
    };

    const checkAccess = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.session) {
          router.push("/login");
          return;
        }

        const role = await getUserRole(session.data.user);
        const normalizedRole = role ? role.toUpperCase() : null;
        
        if (normalizedRole !== "ADMIN") {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);
        setLoading(false);
      } catch {
        router.push("/login");
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  return { authorized, loading };
}
