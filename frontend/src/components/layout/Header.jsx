
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { logout } from "../../services/authService";

function Header({ user, onMenuToggle, isMenuOpen = false }) {
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const dashboardPath =
    user?.role === "RECRUITER"
      ? "/recruiter/dashboard"
      : "/candidate/dashboard";

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error.message || "Logout failed. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="dashboard-sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Brand */}
          <Link
            to={dashboardPath}
            className="flex min-w-0 items-center gap-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BriefcaseBusiness size={21} />
            </span>

            <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
              Job Portal
            </span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
              {user?.fullName || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.role === "RECRUITER" ? "Recruiter" : "Candidate"}
            </p>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <UserRound size={20} />
          </span>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Logout"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:px-4"
          >
            {loggingOut ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}

            <span className="hidden sm:inline">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>

      {/* Logout error */}
      {logoutError && (
        <div
          role="alert"
          className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
}

export default Header;
