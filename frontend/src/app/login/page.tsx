"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth";
import { validateEmail } from "@/lib/utils";
import { formatAuthErrorMessage } from "@/lib/auth";
import { parseAuthError } from "@shared/lib/auth/parse-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Validates redirect URL to prevent open redirect vulnerability.
   * Only allows same-origin relative paths (starting with "/").
   */
  const validateRedirectUrl = (redirectParam: string | null): string => {
    const defaultRedirect = "/dashboard";

    if (!redirectParam) {
      return defaultRedirect;
    }

    try {
      const decoded = decodeURIComponent(redirectParam);

      // Only allow relative paths (same-origin)
      if (!decoded.startsWith("/")) {
        return defaultRedirect;
      }

      // Additional validation: ensure it's a valid path format
      if (decoded.includes("://") || decoded.includes("//")) {
        return defaultRedirect;
      }

      // Validate it's a proper path
      if (decoded.includes("\0") || decoded.includes("\r") || decoded.includes("\n")) {
        return defaultRedirect;
      }

      return decoded;
    } catch (_e) {
      return defaultRedirect;
    }
  };

  // Check for error message in URL query parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      // Clear the error from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      const newUrl = newSearchParams.toString() 
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailOrUsername || emailOrUsername.trim().length === 0) {
      setError("Email or username is required");
      setLoading(false);
      return;
    }

    if (!password || password.length === 0) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      // Detect if input is email (contains @) or username
      const isEmail = emailOrUsername.includes("@");
      let result;

      if (isEmail) {
        // Validate email format
        const emailValidation = validateEmail(emailOrUsername);
        if (!emailValidation.valid) {
          setError(emailValidation.error || "Invalid email");
          setLoading(false);
          return;
        }
        // Sign in with email
        result = await authClient.signIn.email({
          email: emailOrUsername.trim(),
          password,
          rememberMe,
        });
      } else {
        // Sign in with username
        result = await authClient.signIn.username({
          username: emailOrUsername.trim(),
          password,
          rememberMe,
        });
      }

      const resultWithError = result as { error?: { message?: string } | string | unknown } | { data?: unknown };
      if ("error" in resultWithError && resultWithError.error) {
        const defaultMessage = "Login failed. Please check your credentials.";
        const errorMessage = parseAuthError(resultWithError.error, defaultMessage);
        
        const formattedError = formatAuthErrorMessage({ message: errorMessage });
        setError(formattedError || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Verify session was created
      let session = await authClient.getSession();
      let retries = 0;
      while (!session.data?.session && retries < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        session = await authClient.getSession();
        retries++;
      }

      if (session.data?.session) {
        // Wait a bit longer to ensure cookies are fully set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Verify we can get a token before redirecting
        const tokenResult = await authClient.token();
        if (tokenResult.data?.token) {
          // Check for redirect parameter in URL and validate it
          const redirectParam = searchParams.get("redirect");
          const redirectUrl = validateRedirectUrl(redirectParam);
          
          // Use window.location for a hard redirect
          window.location.href = redirectUrl;
          return;
        } else {
          setError("Failed to retrieve authentication token. Please try again.");
          setLoading(false);
        }
      } else {
        setError("Failed to establish session. Please try again.");
        setLoading(false);
      }
    } catch (err: unknown) {
      // Handle special case: Response object with json() method
      if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;
        if (errorObj?.response && typeof errorObj.response === "object") {
          const response = errorObj.response as Record<string, unknown>;
          if (response && typeof response === "object" && "json" in response && typeof response.json === "function") {
            try {
              const responseInstance = response as unknown as Response;
              const responseData = await responseInstance.json();
              if (responseData && typeof responseData === "object") {
                const data = responseData as Record<string, unknown>;
                if (data?.error && typeof data.error === "object") {
                  const error = data.error as Record<string, unknown>;
                  if (typeof error.message === "string") {
                    const formattedError = formatAuthErrorMessage({ message: error.message });
                    setError(formattedError);
                    setLoading(false);
                    return;
                  }
                }
              }
            } catch {
              // Continue to general error parsing
            }
          }
        }
      }
      
      // Use utility function for general error parsing
      const defaultMessage = "Login failed. Please check your credentials.";
      const errorMessage = parseAuthError(err, defaultMessage);
      
      const formattedError = formatAuthErrorMessage({ message: errorMessage });
      setError(formattedError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="emailOrUsername" className="sr-only">
                Email or Username
              </label>
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                placeholder="Email or Username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/90">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  const redirectParam = searchParams.get("redirect");
                  const redirectUrl = validateRedirectUrl(redirectParam);
                  
                  // callbackURL should point to the frontend where user should land after OAuth
                  const callbackURL =
                    typeof window !== "undefined"
                      ? `${window.location.origin}${redirectUrl}`
                      : redirectUrl;
                  
                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL,
                  });
                } catch (err) {
                  console.error("Google OAuth error:", err);
                  setError("Failed to sign in with Google. Please try again.");
                }
              }}
              className="w-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="text-center">
            <Link href="/signup" className="text-primary hover:text-primary/90 font-medium">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
