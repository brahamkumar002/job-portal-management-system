
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const STATUS_CONFIG = {
  APPLIED: {
    label: "Applied",
    description: "Your application has been submitted.",
    icon: Clock3,
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    iconBox: "bg-blue-100 text-blue-600",
    dot: "bg-blue-500",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    description: "You've been shortlisted for this position.",
    icon: CheckCircle2,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconBox: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    description: "This application was not selected.",
    icon: XCircle,
    badge: "border-red-200 bg-red-50 text-red-700",
    iconBox: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
};

const FILTERS = [
  { value: "ALL", label: "All Applications" },
  { value: "APPLIED", label: "Applied" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Rejected" },
];

function extractApplications(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.applications)) return data.applications;
  return [];
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDateTime(value) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      description: "Application status is unavailable.",
      icon: FileText,
      badge: "border-slate-200 bg-slate-50 text-slate-700",
      iconBox: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.badge}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  onClick,
  active = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
        active
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:text-sm">
          {label}
        </p>
      </div>
    </button>
  );
}

function ApplicationCard({ application }) {
  const config = getStatusConfig(application.status);
  const StatusIcon = config.icon;

  const hasJobId =
    application.jobId !== null &&
    application.jobId !== undefined;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60">
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${config.dot}`}
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 ring-1 ring-blue-100">
              <Building2 size={23} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {application.jobTitle || "Untitled Position"}
              </h3>

              <p className="mt-1 flex items-center gap-2 break-words text-sm font-medium text-slate-600">
                <Building2 size={15} className="shrink-0 text-slate-400" />
                {application.companyName || "Company not specified"}
              </p>
            </div>
          </div>

          <StatusBadge status={application.status} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBox}`}
          >
            <StatusIcon size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {config.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {config.description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <CalendarDays
              size={17}
              className="shrink-0 text-slate-400"
            />
            <span>
              Applied:{" "}
              <strong className="font-semibold text-slate-800">
                {formatDate(application.appliedAt)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Clock3
              size={17}
              className="shrink-0 text-slate-400"
            />
            <span>
              Updated:{" "}
              <strong className="font-semibold text-slate-800">
                {formatDate(application.updatedAt)}
              </strong>
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
            <FileCheck2 size={15} />
            Application #{application.id}
          </span>

          {hasJobId ? (
            <Link
              to={`/jobs/${application.jobId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              View Job Details
              <ArrowRight size={16} />
            </Link>
          ) : (
            <span className="text-xs text-slate-400">
              Job details unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const loadApplications = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest(
        "/api/candidate/applications"
      );

      setApplications(extractApplications(data));
    } catch (err) {
      setError(
        err.message || "Unable to load your applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter(
        (application) => application.status === "APPLIED"
      ).length,
      shortlisted: applications.filter(
        (application) => application.status === "SHORTLISTED"
      ).length,
      rejected: applications.filter(
        (application) => application.status === "REJECTED"
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      const matchesSearch =
        !query ||
        [
          application.jobTitle,
          application.companyName,
          String(application.id ?? ""),
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const first = getDateTime(a.appliedAt);
      const second = getDateTime(b.appliedAt);

      return sortOrder === "NEWEST"
        ? second - first
        : first - second;
    });
  }, [applications, search, statusFilter, sortOrder]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setSortOrder("NEWEST");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    sortOrder !== "NEWEST";

  return (
    <DashboardLayout
      title="My Applications"
      description="Track your job applications and stay updated on their status."
    >
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Sparkles size={14} />
                Your Career Journey
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Every application is a step forward.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Keep track of where you've applied, review
                recruiter decisions, and explore more opportunities.
              </p>

              <Link
                to="/jobs"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
              >
                <Search size={17} />
                Explore More Jobs
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-blue-200 sm:h-24 sm:w-24">
              <BriefcaseBusiness size={40} strokeWidth={1.6} />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={loading ? "—" : stats.total}
            icon={FileText}
            iconClass="bg-indigo-50 text-indigo-600"
            onClick={() => setStatusFilter("ALL")}
            active={statusFilter === "ALL"}
          />

          <StatCard
            label="Applied"
            value={loading ? "—" : stats.applied}
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-600"
            onClick={() => setStatusFilter("APPLIED")}
            active={statusFilter === "APPLIED"}
          />

          <StatCard
            label="Shortlisted"
            value={loading ? "—" : stats.shortlisted}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
            onClick={() => setStatusFilter("SHORTLISTED")}
            active={statusFilter === "SHORTLISTED"}
          />

          <StatCard
            label="Rejected"
            value={loading ? "—" : stats.rejected}
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
            onClick={() => setStatusFilter("REJECTED")}
            active={statusFilter === "REJECTED"}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3 text-sm text-red-700">
              <AlertCircle size={19} className="shrink-0" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => loadApplications(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:underline disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Retry
            </button>
          </div>
        )}

        {/* Collection header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <ShieldCheck size={21} className="text-blue-600" />
              Application Tracker
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading your applications..."
                : `${filteredApplications.length} of ${applications.length} applications`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_170px]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job title, company or application ID..."
                aria-label="Search applications"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter by application status"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <TrendingUp
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                aria-label="Sort applications"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
              >
                <X size={14} />
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Application list */}
        {loading ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <section className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Inbox size={32} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              Your submitted job applications will appear here.
              Explore available jobs and apply to positions that
              match your skills.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <BriefcaseBusiness size={18} />
              Browse Jobs
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : filteredApplications.length === 0 ? (
          <section className="rounded-[22px] border border-slate-200 bg-white px-5 py-14 text-center">
            <Search size={30} className="mx-auto text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No matching applications
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
            >
              <X size={16} />
              Clear Filters
            </button>
          </section>
        ) : (
          <div className="grid items-stretch gap-5 xl:grid-cols-2">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
          </div>
        )}

        {/* Info footer */}
        {!loading && applications.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <FileCheck2
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-6 text-slate-600 sm:text-sm">
              Application statuses are updated by recruiters.
              Use the <strong>Refresh</strong> button to check
              for the latest changes.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CandidateApplicationsPage;
