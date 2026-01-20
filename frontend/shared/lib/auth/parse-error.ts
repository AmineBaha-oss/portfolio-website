/**
 * Utility function to parse authentication errors from various formats
 * Handles Better Auth errors, HTTP responses, nested objects, and string formats
 * 
 * @param error - The error to parse (can be string, object, or unknown)
 * @param defaultMessage - Default message to return if no message can be extracted
 * @returns The extracted error message string
 */
export function parseAuthError(
  error: unknown,
  defaultMessage: string = "Login failed. Please check your credentials."
): string {
  if (!error) {
    return defaultMessage;
  }

  // Handle string errors
  if (typeof error === "string") {
    // Try to parse as JSON if it looks like JSON
    if (error.includes('"message"') || error.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(error);
        if (parsed?.error?.message) {
          return parsed.error.message;
        } else if (parsed?.message) {
          return parsed.message;
        }
      } catch {
        // Not valid JSON, try regex extraction
        const match = error.match(/"message"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return error;
  }

  // Handle object errors
  if (typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Check for Better Auth error format: { error: { message: string } }
    if (errorObj?.error && typeof errorObj.error === "object") {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === "string") {
        return nestedError.message;
      }
      // Handle deeply nested: { error: { error: { message: string } } }
      if (nestedError.error && typeof nestedError.error === "object") {
        const deeplyNested = nestedError.error as Record<string, unknown>;
        if (typeof deeplyNested.message === "string") {
          return deeplyNested.message;
        }
      }
    }

    // Check for direct message property
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }

    // Check for HTTP response format: { response: { body: string, data: object } }
    if (errorObj?.response && typeof errorObj.response === "object") {
      const response = errorObj.response as Record<string, unknown>;
      
      // Try parsing response.body as JSON
      if (typeof response.body === "string") {
        try {
          const parsed = JSON.parse(response.body);
          if (parsed?.error?.message) {
            return parsed.error.message;
          } else if (parsed?.message) {
            return parsed.message;
          }
        } catch {
          // Not JSON, continue
        }
      }

      // Try response.data
      if (response?.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (data?.error && typeof data.error === "object") {
          const error = data.error as Record<string, unknown>;
          if (typeof error.message === "string") {
            return error.message;
          }
        }
      }
    }

    // Check for data property: { data: { error: { message: string } } }
    if (errorObj?.data && typeof errorObj.data === "object") {
      const data = errorObj.data as Record<string, unknown>;
      if (data?.error && typeof data.error === "object") {
        const error = data.error as Record<string, unknown>;
        if (typeof error.message === "string") {
          return error.message;
        }
      }
    }

    // Try toString() if available
    if (typeof errorObj.toString === "function") {
      const errorString = errorObj.toString();
      if (errorString && errorString !== "[object Object]") {
        try {
          const parsed = JSON.parse(errorString);
          if (parsed?.error?.message) {
            return parsed.error.message;
          } else if (parsed?.message) {
            return parsed.message;
          }
        } catch {
          // Not JSON, continue
        }
      }
    }
  }

  // Fallback: stringify the error
  const errorStr = String(error);
  
  // If it looks like JSON, try to parse it
  if (errorStr.includes('"message"') || errorStr.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(errorStr);
      if (parsed?.error?.message) {
        return parsed.error.message;
      } else if (parsed?.message) {
        return parsed.message;
      }
      // If parsed result is still a string, try parsing again
      if (typeof parsed === "string") {
        try {
          const reParsed = JSON.parse(parsed);
          if (reParsed?.error?.message) {
            return reParsed.error.message;
          } else if (reParsed?.message) {
            return reParsed.message;
          }
        } catch {
          // Try regex extraction
          const match = errorStr.match(/"message"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            return match[1];
          }
        }
      }
    } catch {
      // Not valid JSON, try regex extraction
      const match = errorStr.match(/"message"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  return defaultMessage;
}
