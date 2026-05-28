"use client";

// Removed — no user roles in passcode-based auth
export function useUserRole() {
  return { role: null as string | null, loading: false };
}
