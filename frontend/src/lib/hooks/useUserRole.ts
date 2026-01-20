"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authClient } from "@/lib/auth";
import { getAuthServiceUrl } from "../utils/auth-url";

interface JwtPayload {
  role?: string;
  [key: string]: unknown;
}

/**
 * Custom hook to get the current user's role.
 * 
 * @returns { role: string | null, loading: boolean }
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
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
      } catch (error) {
        // Log errors in development for easier debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to decode JWT payload:', error);
        }
        return null;
      }
    };

    const fetchRoleFromApi = async (userId: string): Promise<string | null> => {
      try {
        // Use centralized helper for normalized auth service URL
        const authApiBase = getAuthServiceUrl();
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
      } catch (error) {
        // Log errors in development for easier debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to fetch role from API:', error);
        }
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

    let isMounted = true;

    const checkRole = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.session) {
          if (isMounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        const userRole = await getUserRole(session.data.user);
        if (isMounted) {
          setRole(userRole);
          setLoading(false);
        }
      } catch (error) {
        // Log errors in development for easier debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to get user role:', error);
        }
        if (isMounted) {
          setRole(null);
          setLoading(false);
        }
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return { role, loading };
}
