
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Filter,
  IndianRupee,
  LayoutGrid,
  List,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const EMPLOYMENT_TYPES = [
  { value: "ALL", label: "All Employment Types" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

const WORK_MODES = [
  { value: "ALL", label: "All Work Modes" },
  { value: "ONSITE", label: "Onsite" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Jobs" },
  { value: "OPEN", label: "Open Jobs" },
  { value: "CLOSED", label: "Closed Jobs" },
];

const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest First" },
  { value: "OLDEST", label: "Oldest First" },
  { value: "DEADLINE", label: "Deadline: Soonest" },
  { value: "TITLE", label: "Title: A to Z" },
];

function extractJobs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.jobs)) return data.jobs;
  return [];
}

function formatEnum(value) {
  if (!value) return "Not specified";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatSalary(min, max) {
  const hasMin = min !== null && min !== undefined && min !== "";
  const hasMax = max !== null && max !== undefined && max !== "";

  if (!hasMin && !hasMax) return "Not disclosed";

  if (hasMin && hasMax) {
    return `${formatINR(min)} – ${formatINR(max)}`;
  }

  if (hasMin) return `From ${formatINR(min)}`;
  return `Up to ${formatINR(max)}`;
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getLocalToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function isDeadlinePassed(deadline) {
  return Boolean(deadline && deadline < getLocalToday());
}

function JobStatusBadge({ status }) {
  const isOpen = status === "OPEN";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${isOpen
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-100 text-slate-600"
        }`}
    >
      {isOpen ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {formatEnum(status)}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function JobCard({
  job,
  onClose,
  onView,
  closingId,
  compact = false,
}) {
  const expired = isDeadlinePassed(job.applicationDeadline);
  const isOpen = job.status === "OPEN";
  const isClosing = closingId === job.id;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5 sm:p-6"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-lg font-extrabold tracking-tight text-slate-900">
                {job.title}
              </h3>

              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <Building2 size={15} className="shrink-0" />
                <span className="break-words">{job.companyName}</span>
              </p>
            </div>
          </div>

          <JobStatusBadge status={job.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <MapPin size={14} />
            {job.location}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <BriefcaseBusiness size={14} />
            {formatEnum(job.employmentType)}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Wifi size={14} />
            {formatEnum(job.workMode)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IndianRupee size={14} />
              Salary Range
            </p>
            <p className="mt-1 break-words text-sm font-bold text-slate-800">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarDays size={14} />
              Application Deadline
            </p>

            <p
              className={`mt-1 text-sm font-bold ${expired ? "text-red-600" : "text-slate-800"
                }`}
            >
              {formatDate(job.applicationDeadline)}
            </p>
          </div>
        </div>

        {isOpen && expired && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-800">
            <Clock3 size={16} className="shrink-0" />
            Application deadline has passed. This job is still marked OPEN in the backend.
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <span className="text-xs text-slate-400">
              Posted {formatDate(job.createdAt)}
            </span>

            <span className="text-xs font-medium text-slate-400">
              Job #{job.id}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/recruiter/jobs/${job.id}/applications`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 sm:text-sm"
            >
              <Users size={16} />
              Applicants
            </Link>

            {isOpen && (
              <Link
                to={`/recruiter/jobs/${job.id}/edit`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:text-sm"
              >
                <Edit3 size={16} />
                Edit
              </Link>
            )}

            {isOpen && (
              <button
                type="button"
                onClick={() => onClose(job)}
                disabled={closingId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:text-sm"
              >
                {isClosing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Close
              </button>
            )}

            <button
              type="button"
              onClick={() => onView(job)}
              title="View job details"
              aria-label={`View details of ${job.title}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <Eye size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecruiterJobsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobToView, setJobToView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [employmentFilter, setEmploymentFilter] = useState("ALL");
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [viewMode, setViewMode] = useState("GRID");

  const [jobToClose, setJobToClose] = useState(null);
  const [closingId, setClosingId] = useState(null);

  const loadJobs = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest("/api/recruiter/jobs");
      setJobs(extractJobs(data));
    } catch (err) {
      setError(err.message || "Unable to load your jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const message = location.state?.successMessage;

    if (typeof message !== "string" || !message.trim()) {
      return;
    }

    setSuccess(message);

    // Message consume karo, taaki refresh par repeat na ho.
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      open: jobs.filter((job) => job.status === "OPEN").length,
      closed: jobs.filter((job) => job.status === "CLOSED").length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [job.title, job.companyName, job.location, String(job.id ?? "")]
          .some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;

      const matchesEmployment =
        employmentFilter === "ALL" ||
        job.employmentType === employmentFilter;

      const matchesWorkMode =
        workModeFilter === "ALL" ||
        job.workMode === workModeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEmployment &&
        matchesWorkMode
      );
    });

    return result.sort((a, b) => {
      if (sortOrder === "OLDEST") {
        return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
      }

      if (sortOrder === "DEADLINE") {
        return String(a.applicationDeadline || "").localeCompare(
          String(b.applicationDeadline || "")
        );
      }

      if (sortOrder === "TITLE") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });
  }, [
    jobs,
    search,
    statusFilter,
    employmentFilter,
    workModeFilter,
    sortOrder,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    employmentFilter !== "ALL" ||
    workModeFilter !== "ALL" ||
    sortOrder !== "NEWEST";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setEmploymentFilter("ALL");
    setWorkModeFilter("ALL");
    setSortOrder("NEWEST");
  }

  async function confirmCloseJob() {
    if (!jobToClose || closingId !== null) return;

    const selectedJob = jobToClose;
    setClosingId(selectedJob.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/recruiter/jobs/${selectedJob.id}/close`,
        { method: "PATCH" }
      );

      setJobs((previous) =>
        previous.map((job) =>
          job.id === selectedJob.id
            ? { ...job, status: "CLOSED" }
            : job
        )
      );

      setSuccess(`"${selectedJob.title}" has been closed successfully.`);
      setJobToClose(null);

      // Refresh to receive the backend's final job state.
      await loadJobs(true);
    } catch (err) {
      setError(err.message || "Unable to close the job.");
      setJobToClose(null);
    } finally {
      setClosingId(null);
    }
  }

  return (
    <DashboardLayout
      title="Manage Jobs"
      description="View, edit and manage all your recruitment listings."
    >
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Sparkles size={14} />
                Recruitment Workspace
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Manage every opportunity.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Organize job postings, review applicants, and keep
                your recruitment process moving.
              </p>

              <Link
                to="/recruiter/jobs/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
              >
                <Plus size={18} />
                Post New Job
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-blue-200 sm:h-24 sm:w-24">
              <BriefcaseBusiness size={40} strokeWidth={1.6} />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Jobs",
              value: stats.total,
              icon: BriefcaseBusiness,
              filter: "ALL",
              iconClass: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Open Jobs",
              value: stats.open,
              icon: CheckCircle2,
              filter: "OPEN",
              iconClass: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Closed Jobs",
              value: stats.closed,
              icon: XCircle,
              filter: "CLOSED",
              iconClass: "bg-slate-100 text-slate-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.filter}
                type="button"
                onClick={() => setStatusFilter(stat.filter)}
                aria-pressed={statusFilter === stat.filter}
                className={`rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md sm:p-5 ${statusFilter === stat.filter
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-slate-200"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={19} />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {loading ? "—" : stat.value}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
                  {stat.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Notifications */}
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
              onClick={() => loadJobs(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <div className="flex items-start gap-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={19} className="shrink-0" />
              {success}
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="text-emerald-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Filter size={19} className="text-blue-600" />
                Find Your Jobs
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Search and filter your posted opportunities.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="relative mb-3">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search job title, company, location or job ID..."
              aria-label="Search jobs"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              ariaLabel="Filter by job status"
            />

            <FilterSelect
              value={employmentFilter}
              onChange={setEmploymentFilter}
              options={EMPLOYMENT_TYPES}
              ariaLabel="Filter by employment type"
            />

            <FilterSelect
              value={workModeFilter}
              onChange={setWorkModeFilter}
              options={WORK_MODES}
              ariaLabel="Filter by work mode"
            />

            <FilterSelect
              value={sortOrder}
              onChange={setSortOrder}
              options={SORT_OPTIONS}
              ariaLabel="Sort jobs"
            />
          </div>
        </section>

        {/* Listing heading */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Job Listings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading jobs..."
                : `${filteredJobs.length} of ${jobs.length} jobs`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                aria-label="Grid view"
                aria-pressed={viewMode === "GRID"}
                className={`rounded-lg p-2 transition ${viewMode === "GRID"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <LayoutGrid size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("LIST")}
                aria-label="List view"
                aria-pressed={viewMode === "LIST"}
                className={`rounded-lg p-2 transition ${viewMode === "LIST"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <List size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadJobs(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-[22px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={32} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No jobs posted yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              Create your first job posting to start attracting candidates.
            </p>

            <Link
              to="/recruiter/jobs/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Post Your First Job
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-14 text-center">
            <Search size={30} className="mx-auto text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No matching jobs
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={`grid items-stretch gap-5 ${viewMode === "GRID" ? "xl:grid-cols-2" : "grid-cols-1"
              }`}
          >
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClose={setJobToClose}
                onView={setJobToView}
                closingId={closingId}
                compact={viewMode === "LIST"}
              />
            ))}
          </div>
        )}

        {/* Information */}
        {!loading && jobs.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <ShieldAlert
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-6 text-slate-600 sm:text-sm">
              Closing a job stops it from accepting new applications.
              Existing applications remain available for review.
              All salary amounts are displayed in Indian Rupees (₹).
            </p>
          </div>
        )}
      </div>

      {/* Close job confirmation */}
      {jobToClose && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              closingId === null
            ) {
              setJobToClose(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-job-title"
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={27} />
            </div>

            <h2
              id="close-job-title"
              className="mt-5 text-xl font-extrabold text-slate-900"
            >
              Close this job?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              You're about to close{" "}
              <strong className="text-slate-900">
                {jobToClose.title}
              </strong>
              . Candidates will no longer be able to apply to this job.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setJobToClose(null)}
                disabled={closingId !== null}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmCloseJob}
                disabled={closingId !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {closingId !== null ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <XCircle size={17} />
                )}
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}


      {jobToView && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setJobToView(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-job-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                  Recruiter Job Details
                </p>

                <h2
                  id="view-job-title"
                  className="break-words text-xl font-extrabold text-slate-900 sm:text-2xl"
                >
                  {jobToView.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {jobToView.companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setJobToView(null)}
                aria-label="Close job details"
                className="shrink-0 rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <JobStatusBadge status={jobToView.status} />

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {formatEnum(jobToView.employmentType)}
                </span>

                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  {formatEnum(jobToView.workMode)}
                </span>
              </div>

              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Location</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {jobToView.location || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">Salary Range</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatSalary(jobToView.salaryMin, jobToView.salaryMax)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Application Deadline
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatDate(jobToView.applicationDeadline)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">Posted On</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatDate(jobToView.createdAt)}
                  </p>
                </div>

                {jobToView.status === "CLOSED" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Closed On</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatDate(jobToView.closedAt)}
                    </p>
                  </div>
                )}
              </div>

              <section>
                <h3 className="text-base font-extrabold text-slate-900">
                  Job Description
                </h3>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                  {jobToView.description || "No description provided."}
                </p>
              </section>

              <section>
                <h3 className="text-base font-extrabold text-slate-900">
                  Requirements
                </h3>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                  {jobToView.requirements || "No requirements provided."}
                </p>
              </section>

              {jobToView.status === "CLOSED" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle size={19} className="shrink-0 text-amber-600" />
                  <p className="text-sm leading-6 text-amber-800">
                    This job is closed and no longer accepts new applications.
                    Its details are available for your records.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4 sm:px-6">
              <button
                type="button"
                onClick={() => setJobToView(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default RecruiterJobsPage;
