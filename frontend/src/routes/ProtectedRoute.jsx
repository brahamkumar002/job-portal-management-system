
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { getCurrentUser } from "../services/authService";
import ErrorPage from "../pages/ErrorPage";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const checkAuthentication = useCallback(async () => {
    setChecking(true);
    setError("");

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);

      if (
        err.message?.includes("401") ||
        err.message?.includes("403")
      ) {
        setError("UNAUTHORIZED");
      } else {
        setError("SERVER_ERROR");
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [location.pathname, checkAuthentication]);

  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) {
        checkAuthentication();
      }
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [checkAuthentication]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div
          role="status"
          className="flex items-center gap-3 text-blue-600"
        >
          <LoaderCircle size={24} className="animate-spin" />
          <span className="text-sm font-semibold">
            Verifying your account...
          </span>
        </div>
      </main>
    );
  }

  if (error === "SERVER_ERROR") {
    return <ErrorPage code={500} />;
  }

  if (error === "UNAUTHORIZED" || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <ErrorPage code={403} />;
  }

  return children;
}

export default ProtectedRoute;
