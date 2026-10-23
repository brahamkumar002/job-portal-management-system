
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness,
  Code2,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

const candidateLinks = [
  {
    label: "Dashboard",
    path: "/candidate/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Browse Jobs",
    path: "/jobs",
    icon: Search,
  },
  {
    label: "My Profile",
    path: "/candidate/profile",
    icon: UserRound,
  },
  {
    label: "My Projects",
    path: "/candidate/projects",
    icon: Code2,
  },
  {
    label: "My Applications",
    path: "/candidate/applications",
    icon: FileText,
  },
];

const recruiterLinks = [
  {
    label: "Dashboard",
    path: "/recruiter/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Jobs",
    path: "/recruiter/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Post a Job",
    path: "/recruiter/jobs/new",
    icon: FilePlus2,
  },
];

function Sidebar({
  role,
  isOpen = false,
  onClose = () => {},
}) {
  const location = useLocation();

  const links =
    role === "RECRUITER"
      ? recruiterLinks
      : candidateLinks;

  // Close mobile sidebar after navigation.
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent background scrolling when mobile sidebar is open.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function renderLinks() {
    return links.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={
          path === "/candidate/dashboard" ||
          path === "/recruiter/dashboard" ||
          path === "/recruiter/jobs"
        }
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isActive
              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
              : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
          }`
        }
      >
        <Icon size={19} className="shrink-0" />
        <span>{label}</span>
      </NavLink>
    ));
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block"
        aria-label="Dashboard sidebar"
      >
        <div className="mb-3 px-4 pt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {role === "RECRUITER"
              ? "Recruiter Workspace"
              : "Candidate Workspace"}
          </p>
        </div>

        <nav className="space-y-1" aria-label="Desktop navigation">
          {renderLinks()}
        </nav>

        <div className="mt-5 rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            {role === "RECRUITER" ? (
              <Users size={18} />
            ) : (
              <BriefcaseBusiness size={18} />
            )}

            <span className="text-sm font-bold">
              {role === "RECRUITER"
                ? "Find great talent"
                : "Grow your career"}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-blue-700/80">
            {role === "RECRUITER"
              ? "Manage your openings and review candidates."
              : "Keep your profile updated and explore new opportunities."}
          </p>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="dashboard-sidebar"
        aria-label="Mobile dashboard navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-[min(85vw,300px)] overflow-y-auto bg-white p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-7 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BriefcaseBusiness size={20} />
            </span>

            <span className="text-lg font-bold text-slate-900">
              Job Portal
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          {role === "RECRUITER"
            ? "Recruiter Workspace"
            : "Candidate Workspace"}
        </p>

        <nav className="space-y-1" aria-label="Mobile navigation">
          {renderLinks()}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
