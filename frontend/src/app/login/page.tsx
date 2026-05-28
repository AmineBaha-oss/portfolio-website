"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./page.module.scss";

function LoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        setError("Invalid passcode. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
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
            Admin Access
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Enter your passcode to continue
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
              <label htmlFor="passcode">Passcode</label>
              <input
                id="passcode"
                name="passcode"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Verifying...' : 'Enter'}
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
