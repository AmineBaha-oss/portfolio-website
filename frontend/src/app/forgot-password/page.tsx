"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth";
import { validateEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || "Invalid email");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Failed to send password reset email. Please try again."
        );
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-primary/5 border border-primary/20 text-foreground px-4 py-3 rounded-md text-sm">
              <p className="font-medium text-foreground">
                Password reset email sent!
              </p>
              <p className="mt-1 text-muted-foreground">
                Please check your inbox for instructions.
              </p>
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success || loading}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full"
            >
              {loading
                ? "Sending..."
                : success
                ? "Email Sent!"
                : "Send Reset Link"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
