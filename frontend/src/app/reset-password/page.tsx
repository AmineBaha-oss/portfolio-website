"use client";

import { useState, useEffect, Suspense } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth";
import { validatePassword } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get("token");
  useEffect(() => {
    if (!success) return;
    const callbackURL = searchParams.get("callbackURL");
    let redirectPath = "/login";
    
    if (callbackURL) {
      // Validate callbackURL: only allow relative paths or same origin
      try {
        if (callbackURL.startsWith("//")) {
          // Invalid URL, fall back to login
        } else {
          const url = new URL(callbackURL, typeof window !== "undefined" ? window.location.origin : "http://localhost");
          if (typeof window !== "undefined" && url.origin === window.location.origin) {
            redirectPath = callbackURL.startsWith("/") ? callbackURL : url.pathname + url.search;
          }
        }
      } catch {
        // Invalid URL, fall back to login
      }
    }
    
    const id = setTimeout(() => router.push(redirectPath), 3000);
    return () => clearTimeout(id);
  }, [success, router, searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        setError("Invalid reset token");
        setLoading(false);
        return;
      }
      
      const result = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (result.error) {
        setError(result.error.message || "Failed to reset password. The link may be expired or invalid.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error || "No reset token provided. Please request a new password reset link."}
            </p>
          </div>
          <div className="text-center">
            <Link href="/forgot-password" className="text-primary hover:text-primary-hover">
              Request new reset link
            </Link>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-primary hover:text-primary-hover">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Password reset successfully! Redirecting to login...
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={success || loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={success || loading}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full"
            >
              {loading ? "Resetting..." : success ? "Password Reset!" : "Reset Password"}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-primary hover:text-primary-hover">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
