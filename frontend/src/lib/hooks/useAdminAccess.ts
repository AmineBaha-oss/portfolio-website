"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdminAccess() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-auth')
      .then((r) => {
        setAuthorized(r.ok);
        if (!r.ok) router.push('/login');
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
        setLoading(false);
      });
  }, [router]);

  return { authorized, loading };
}
