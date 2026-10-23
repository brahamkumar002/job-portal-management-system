
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
  register,
} from "../services/authService";

const dashboardPaths = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/dashboard",
};

function RegisterPage() {
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CANDIDATE",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged-in users should not register again.
  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        const path = dashboardPaths[user?.role];

        if (path) {
          navigate(path, { replace: true });
        }
      } catch {
        // No active session: show registration form.
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function selectRole(role) {
    setFormData((previous) => ({
      ...previous,
      role,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!fullName) {
      setError("Full name is required.");
      nameRef.current?.focus();
      return;
    }

    if (fullName.length > 100) {
      setError("Full name cannot exceed 100 characters.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (email.length > 150) {
      setError("Email cannot exceed 150 characters.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        fullName,
        email,
        password,
        role: formData.role,
      });

      navigate("/login", {
        replace: true,
        state: {
          successMessage:
            "Account created successfully! Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div
          role="status"
          className="flex items-center gap-3 text-blue-600"
        >
          <LoaderCircle
            size={24}
            className="animate-spin"
          />
          <span className="text-sm font-semibold">
            Checking your session...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Branding */}
        <div className="mb-7 text-center">
          <Link
            to="/login"
            className="mx-auto mb-5 flex w-fit items-center gap-2"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <BriefcaseBusiness size={24} />
            </span>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Job Portal
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create your account
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Join us and take the next step in your career.
          </p>
        </div>

        {/* Registration card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selection */}
            <fieldset disabled={loading}>
              <legend className="mb-3 text-sm font-semibold text-slate-700">
                I want to join as
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectRole("CANDIDATE")}
                  aria-pressed={formData.role === "CANDIDATE"}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    formData.role === "CANDIDATE"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <UserRound
                    size={23}
                    className={
                      formData.role === "CANDIDATE"
                        ? "text-blue-600"
                        : "text-slate-500"
                    }
                  />

                  <div className="mt-3 flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">
                      Candidate
                    </span>

                    {formData.role === "CANDIDATE" && (
                      <CheckCircle2
                        size={17}
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Find and apply for jobs
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectRole("RECRUITER")}
                  aria-pressed={formData.role === "RECRUITER"}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    formData.role === "RECRUITER"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <Users
                    size={23}
                    className={
                      formData.role === "RECRUITER"
                        ? "text-blue-600"
                        : "text-slate-500"
                    }
                  />

                  <div className="mt-3 flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">
                      Recruiter
                    </span>

                    {formData.role === "RECRUITER" && (
                      <CheckCircle2
                        size={17}
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Post jobs and hire talent
                  </p>
                </button>
              </div>
            </fieldset>

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  ref={nameRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="registerEmail"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={150}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="registerPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="registerPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Use between 8 and 72 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Job Portal Management System
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
