
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Home,
  ShieldX,
  SearchX,
} from "lucide-react";

function ErrorPage({
  code = 404,
  title,
  message,
}) {
  const navigate = useNavigate();

  const errorConfig = {
    403: {
      title: "Access Denied",
      message: "You don't have permission to access this page.",
      icon: ShieldX,
    },
    404: {
      title: "Page Not Found",
      message:
        "The page you're looking for doesn't exist or has been moved.",
      icon: SearchX,
    },
    500: {
      title: "Something Went Wrong",
      message:
        "An unexpected error occurred. Please try again later.",
      icon: AlertTriangle,
    },
  };

  const config = errorConfig[code] || errorConfig[500];
  const Icon = config.icon;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg text-center">

        {/* Brand */}
        <div className="mb-10 flex items-center justify-center gap-2 text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BriefcaseBusiness size={21} />
          </div>

          <span className="text-lg font-bold tracking-tight">
            Job Portal
          </span>
        </div>

        {/* Error Card */}
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-xl shadow-slate-200/60 sm:px-10 sm:py-12">

          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
            <Icon size={38} strokeWidth={1.7} />
          </div>

          <p className="text-7xl font-extrabold tracking-tight text-blue-600 sm:text-8xl">
            {code}
          </p>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title || config.title}
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500 sm:text-base">
            {message || config.message}
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
            >
              <Home size={18} />
              Go to Home
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          Need help? Please check the URL and try again.
        </p>
      </div>
    </main>
  );
}

export default ErrorPage;
