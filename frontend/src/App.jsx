
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./routes/ProtectedRoute";

// Discover all page files automatically
const pageModules = import.meta.glob("./pages/**/*.jsx");

// Centralized route configuration
const routeConfig = [
  // Authentication
  {
    path: "/login",
    file: "LoginPage",
    access: "public",
  },
  {
    path: "/register",
    file: "RegisterPage",
    access: "public",
  },

  // Public jobs
  {
    path: "/jobs",
    file: "JobsPage",
    access: "public",
  },
  {
    path: "/jobs/:jobId",
    file: "JobDetailsPage",
    access: "public",
  },

  // Candidate pages
  {
    path: "/candidate/dashboard",
    file: "CandidateDashboardPage",
    access: "candidate",
  },
  {
    path: "/candidate/profile",
    file: "CandidateProfilePage",
    access: "candidate",
  },
  {
    path: "/candidate/projects",
    file: "CandidateProjectsPage",
    access: "candidate",
  },
  {
    path: "/candidate/applications",
    file: "CandidateApplicationsPage",
    access: "candidate",
  },

  // Recruiter pages
  {
    path: "/recruiter/dashboard",
    file: "RecruiterDashboardPage",
    access: "recruiter",
  },
  {
    path: "/recruiter/jobs",
    file: "RecruiterJobsPage",
    access: "recruiter",
  },
  {
    path: "/recruiter/jobs/new",
    file: "CreateJobPage",
    access: "recruiter",
  },
  {
    path: "/recruiter/jobs/:jobId/edit",
    file: "EditJobPage",
    access: "recruiter",
  },
  {
    path: "/recruiter/jobs/:jobId/applications",
    file: "RecruiterApplicationsPage",
    access: "recruiter",
  },
];

function PageLoader() {
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
          Loading page...
        </span>
      </div>
    </main>
  );
}

function getPageComponent(fileName) {
  const filePath = `./pages/${fileName}.jsx`;
  const importer = pageModules[filePath];

  if (!importer) {
    return null;
  }

  return lazy(importer);
}

function renderRoute(Page, access) {
  if (access === "candidate") {
    return (
      <ProtectedRoute allowedRoles={["CANDIDATE"]}>
        <Page />
      </ProtectedRoute>
    );
  }

  if (access === "recruiter") {
    return (
      <ProtectedRoute allowedRoles={["RECRUITER"]}>
        <Page />
      </ProtectedRoute>
    );
  }

  return <Page />;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Automatically loaded pages */}
        {routeConfig.map(({ path, file, access }) => {
          const Page = getPageComponent(file);

          return (
            <Route
              key={path}
              path={path}
              element={
                Page ? (
                  renderRoute(Page, access)
                ) : (
                  <ErrorPage code={404} />
                )
              }
            />
          );
        })}

        {/* Error pages */}
        <Route
          path="/403"
          element={<ErrorPage code={403} />}
        />

        <Route
          path="/404"
          element={<ErrorPage code={404} />}
        />

        <Route
          path="/500"
          element={<ErrorPage code={500} />}
        />

        {/* Unknown URLs */}
        <Route
          path="*"
          element={<ErrorPage code={404} />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
