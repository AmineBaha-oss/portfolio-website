"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { validateEmail } from "@/lib/utils";
import { formatAuthErrorMessage } from "@/lib/auth";
import { parseAuthError } from "@shared/lib/auth/parse-error";
import { motion } from "framer-motion";
import styles from "./page.module.scss";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
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
        });
      } else {
        // Sign in with username
        result = await authClient.signIn.username({
          username: emailOrUsername.trim(),
          password,
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
    <div className={styles.loginPage}>
      <motion.div 
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <div className={styles.header}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Sign in to continue
          </motion.p>
        </div>

        <motion.div 
          className={styles.formWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form onSubmit={handleLogin}>
            {error && (
              <motion.div 
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="emailOrUsername">Email or Username</label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className={styles.divider}>
              <span>Or continue with</span>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const redirectParam = searchParams.get("redirect");
                  const redirectUrl = validateRedirectUrl(redirectParam);
                  
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
              className={styles.googleButton}
            >
              <svg viewBox="0 0 24 24">
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
            </button>
          </form>
        </motion.div>
      </motion.div>
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
