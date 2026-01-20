/**
 * Auth error handling utilities
 * Centralizes logic for detecting and formatting authentication errors
 */

const UNVERIFIED_EMAIL_MESSAGE =
  "Please verify your email address before logging in. Check your inbox for the verification link.";

/**
 * Format authentication error message
 * Detects unverified email errors and provides user-friendly messages
 */
export function formatAuthErrorMessage(error: { message?: string } | string | null | undefined): string {
  // Handle string errors
  if (typeof error === "string") {
    const errorMessage = error.toLowerCase();
    if (errorMessage.includes("email") && errorMessage.includes("verif")) {
      return UNVERIFIED_EMAIL_MESSAGE;
    }
    return error;
  }

  // Handle object errors
  if (!error?.message) {
    return "An error occurred. Please try again.";
  }

  const errorMessage = error.message.toLowerCase();

  // Check if error is due to unverified email
  if (errorMessage.includes("email") && errorMessage.includes("verif")) {
    return UNVERIFIED_EMAIL_MESSAGE;
  }

  // Also check for the exact message we send from backend
  if (errorMessage.includes("please verify your email address")) {
    return UNVERIFIED_EMAIL_MESSAGE;
  }

  if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
    if (!errorMessage.includes("verif") && !errorMessage.includes("email")) {
      return UNVERIFIED_EMAIL_MESSAGE;
    }
  }

  // Return the original error message
  return error.message;
}
