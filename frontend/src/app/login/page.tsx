"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { validateEmail } from "@/lib/utils";
import { formatAuthErrorMessage } from "@/lib/auth";
import { parseAuthError } from "@shared/lib/auth/parse-error";
import { motion } from "framer-motion";
import styles from "./page.module.scss";
import { useTranslations } from "@/lib/i18n/hooks";
import LanguageToggle from "@/components/portfolio/LanguageToggle";

function LoginForm() {
  const { t } = useTranslations();
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
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 1000 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </div>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 1000 }}>
        <LanguageToggle />
      </div>
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
            {t('login.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('login.subtitle')}
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
              <label htmlFor="emailOrUsername">{t('login.email')}</label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                placeholder={t('login.emailPlaceholder')}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">{t('login.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? t('login.submitting') : t('login.submit')}
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
