
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

import { getCurrentUser } from "../../services/authService";

function DashboardLayout({ children, title, description }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mountedRef = useRef(false);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentUser = await getCurrentUser();

      if (!mountedRef.current) return;

      setUser(currentUser);
    } catch (err) {
      if (!mountedRef.current) return;

      setError(
        err.message || "Unable to load your account details."
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadUser();

    return () => {
      mountedRef.current = false;
    };
  }, [loadUser]);

  // Close mobile menu when Escape is pressed.
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  function toggleMenu() {
    setIsMenuOpen((previous) => !previous);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  if (loading) {
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
            Loading your workspace...
          </span>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load workspace
          </h1>

          <p role="alert" className="mt-3 text-sm text-red-600">
            {error || "User details are unavailable."}
          </p>

          <button
            type="button"
            onClick={loadUser}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Reusable Header */}
      <Header
        user={user}
        isMenuOpen={isMenuOpen}
        onMenuToggle={toggleMenu}
      />

      {/* Main workspace */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        {/* Reusable Sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Sidebar
            role={user.role}
            isOpen={isMenuOpen}
            onClose={closeMenu}
          />
        </div>

        {/* Page-specific content */}
        <main className="min-w-0">
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h1>
              )}

              {description && (
                <p className="mt-2 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Reusable Footer */}
      <Footer role={user.role} />
    </div>
  );
}

export default DashboardLayout;
