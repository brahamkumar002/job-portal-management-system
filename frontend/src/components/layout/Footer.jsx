
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Heart,
  ShieldCheck,
} from "lucide-react";

function Footer({ role }) {
  const currentYear = new Date().getFullYear();

  const dashboardPath =
    role === "RECRUITER"
      ? "/recruiter/dashboard"
      : "/candidate/dashboard";

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          {/* Brand and copyright */}
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 font-bold text-slate-900 transition hover:text-blue-600"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <BriefcaseBusiness size={18} />
              </span>

              <span>Job Portal</span>
            </Link>

            <span className="hidden text-slate-300 sm:inline">
              |
            </span>

            <p className="text-xs text-slate-500">
              © {currentYear} Job Portal Management System.
              All rights reserved.
            </p>
          </div>

          {/* Footer details */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck
                size={15}
                className="text-blue-600"
              />
              Secure Platform
            </span>

            <span className="inline-flex items-center gap-1.5">
              Built with
              <Heart
                size={14}
                className="fill-red-500 text-red-500"
              />
              using React & Spring Boot
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
