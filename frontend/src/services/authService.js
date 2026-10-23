
import { apiRequest } from "./api";

// Register a new candidate or recruiter
export async function register(userData) {
  return await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Login using email and password
export async function login(email, password) {
  return await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// Get currently logged-in user
export async function getCurrentUser() {
  return await apiRequest("/api/auth/me");
}

// Logout and invalidate current session
export async function logout() {
  return await apiRequest("/api/auth/logout", {
    method: "POST",
  });
}
