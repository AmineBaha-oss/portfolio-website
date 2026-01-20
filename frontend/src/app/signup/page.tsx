"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth";
import { validateEmail, validatePassword, validateFirstName, validateLastName, validateConfirmPassword, validateUsername } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Check username availability in real-time
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username || username.trim().length < 3) {
        setUsernameAvailable(null);
        return;
      }

      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        setUsernameAvailable(false);
        return;
      }

      setCheckingUsername(true);
      try {
        const result = await authClient.isUsernameAvailable({ username: username.trim() });
        if (result.data) {
          setUsernameAvailable(result.data.available ?? false);
        } else if (result.error) {
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable(null);
        }
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      checkUsernameAvailability();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimer);
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    const firstNameValidation = validateFirstName(firstName);
    if (!firstNameValidation.valid) {
      setError(firstNameValidation.error || "Invalid first name");
      setLoading(false);
      return;
    }

    const lastNameValidation = validateLastName(lastName);
    if (!lastNameValidation.valid) {
      setError(lastNameValidation.error || "Invalid last name");
      setLoading(false);
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || "Invalid email");
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password");
      setLoading(false);
      return;
    }

    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmPasswordValidation.valid) {
      setError(confirmPasswordValidation.error || "Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate username if provided
    if (username && username.trim().length > 0) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        setError(usernameValidation.error || "Invalid username");
        setLoading(false);
        return;
      }

      if (usernameAvailable === false) {
        setError("Username is not available. Please choose another one.");
        setLoading(false);
        return;
      }

      if (checkingUsername) {
        setError("Please wait while we check username availability.");
        setLoading(false);
        return;
      }
    }

    try {
      const signUpData: {
        email: string;
        password: string;
        name: string;
        username?: string;
      } = {
        email: email.trim(),
        password,
        name: `${firstName.trim()} ${lastName.trim()}`,
      };

      // Add username if provided
      if (username && username.trim().length > 0) {
        signUpData.username = username.trim();
      }

      const result = await authClient.signUp.email(signUpData);

      if (result.error) {
        setError(result.error.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }

      // With requireEmailVerification: true, users must verify email before getting a session
      setShowVerificationMessage(true);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {showVerificationMessage && (
            <div className="bg-primary/5 border border-primary/20 text-foreground px-4 py-3 rounded-md text-sm">
              <p className="font-medium text-foreground">Account created successfully!</p>
              <p className="mt-1 text-muted-foreground">
                We've sent a verification email to {email.trim()}. Please check your inbox and click the verification link to activate your account.
              </p>
              <p className="mt-2 font-semibold text-foreground">
                You must verify your email before you can log in.
              </p>
              <p className="mt-2">
                <Link href="/login" className="text-primary hover:text-primary/90 underline transition-colors">
                  Go to login
                </Link>
              </p>
            </div>
          )}
          {error && !showVerificationMessage && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
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
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username (Optional)
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username (Optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {username && username.trim().length > 0 && (
                <div className="mt-1 text-xs">
                  {checkingUsername ? (
                    <span className="text-gray-500">Checking availability...</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-green-600">Username is available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-red-600">Username is not available</span>
                  ) : null}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || showVerificationMessage}
              className="w-full"
            >
              {loading 
                ? "Creating account..." 
                : showVerificationMessage 
                  ? "Account Created!" 
                  : "Sign up"
              }
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
