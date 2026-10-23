
const BASE_URL = "http://localhost:8080";

// Get CSRF token from Spring Boot
export async function getCsrfToken() {
  const response = await fetch(`${BASE_URL}/api/auth/csrf`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get CSRF token");
  }

  const data = await response.json();
  return data.token;
}

// Common function for all backend API calls
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = {
    ...options.headers,
  };

  // CSRF token required for POST, PUT, PATCH, DELETE
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await getCsrfToken();
    headers["X-XSRF-TOKEN"] = csrfToken;
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  // Handle errors
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // Use default error message
    }

    throw new Error(message);
  }

  // DELETE APIs may return 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
