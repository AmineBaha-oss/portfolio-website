/**
 * Validation utilities for form inputs
 */

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, error: "Password must contain at least one letter and one number" };
  }

  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters long" };
  }

  if (name.trim().length > 100) {
    return { valid: false, error: "Name must be less than 100 characters" };
  }

  return { valid: true };
}

export function validateFirstName(firstName: string): { valid: boolean; error?: string } {
  if (!firstName || firstName.trim().length === 0) {
    return { valid: false, error: "First name is required" };
  }

  if (firstName.trim().length < 2) {
    return { valid: false, error: "First name must be at least 2 characters long" };
  }

  if (firstName.trim().length > 100) {
    return { valid: false, error: "First name must be less than 100 characters" };
  }

  return { valid: true };
}

export function validateLastName(lastName: string): { valid: boolean; error?: string } {
  if (!lastName || lastName.trim().length === 0) {
    return { valid: false, error: "Last name is required" };
  }

  if (lastName.trim().length < 2) {
    return { valid: false, error: "Last name must be at least 2 characters long" };
  }

  if (lastName.trim().length > 100) {
    return { valid: false, error: "Last name must be less than 100 characters" };
  }

  return { valid: true };
}

export function validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { valid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }

  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: true }; // Username is optional
  }

  if (username.trim().length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long" };
  }

  if (username.trim().length > 30) {
    return { valid: false, error: "Username must be less than 30 characters" };
  }

  // Only allow alphanumeric characters, underscores, and dots
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, underscores, and dots" };
  }

  return { valid: true };
}
