"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

function ResetPasswordTokenRedirect() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const callbackURL = searchParams.get("callbackURL");

  useEffect(() => {
    if (token) {
      // Preserve callbackURL if present, redirect to query parameter format
      const queryParams = new URLSearchParams();
      queryParams.set("token", token);
      if (callbackURL) {
        queryParams.set("callbackURL", callbackURL);
      }
      router.replace(`/reset-password?${queryParams.toString()}`);
    } else {
      router.replace("/reset-password");
    }
  }, [token, callbackURL, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}

export default function ResetPasswordTokenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ResetPasswordTokenRedirect />
    </Suspense>
  );
}
