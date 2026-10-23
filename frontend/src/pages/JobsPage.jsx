
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
  Filter,
  IndianRupee,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";

import { apiRequest } from "../services/api";
import { getCurrentUser } from "../services/authService";

const PAGE_SIZE = 9;

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

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function extractJobs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.jobs)) return data.jobs;
  return [];
}

function formatINR(amount) {
  const value = Number(amount);

  return Number.isFinite(value)
    ? INR_FORMATTER.format(value)
    : "Not disclosed";
}

function formatSalary(min, max) {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  if (hasMin && hasMax) {
    return `${formatINR(min)} – ${formatINR(max)}`;
  }

  if (hasMin) return `From ${formatINR(min)}`;
  if (hasMax) return `Up to ${formatINR(max)}`;

  return "Not disclosed";
}

function formatEnum(value) {
  if (!value) return "Not specified";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTodayLocal() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getTimeValue(value) {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function JobCard({ job }) {
  const deadlinePassed =
    Boolean(job.applicationDeadline) &&
    job.applicationDeadline < getTodayLocal();

  const employmentLabel = formatEnum(job.employmentType);
  const workModeLabel = formatEnum(job.workMode);

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
          <Building2 size={24} />
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          OPEN
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <Link
          to={`/jobs/${job.id}`}
          className="block break-words text-lg font-extrabold leading-snug tracking-tight text-slate-900 transition hover:text-blue-600"
        >
          {job.title}
        </Link>

        <p className="mt-2 flex items-center gap-2 break-words text-sm font-semibold text-slate-500">
          <Building2 size={15} className="shrink-0" />
          {job.companyName}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-600">
          <MapPin size={13} />
          {job.location || "Not specified"}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700">
          <BriefcaseBusiness size={13} />
          {employmentLabel}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-2 text-xs font-semibold text-indigo-700">
          <Wifi size={13} />
          {workModeLabel}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <IndianRupee size={14} />
          Salary Range
        </p>

        <p className="mt-2 break-words text-base font-extrabold text-slate-900">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </p>
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <CalendarDays size={15} className="shrink-0" />
          <span>
            Apply by{" "}
            <strong
              className={
                deadlinePassed
                  ? "text-red-600"
                  : "text-slate-700"
              }
            >
              {formatDate(job.applicationDeadline)}
            </strong>
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500">
          <Clock3 size={15} className="shrink-0" />
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Link
          to={`/jobs/${job.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          View Details
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [employmentType, setEmploymentType] = useState("ALL");
  const [workMode, setWorkMode] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest("/api/jobs");
      setJobs(extractJobs(data));
    } catch (err) {
      setError(err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();

    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [loadJobs]);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status === "OPEN"),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    const result = openJobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.title,
          job.companyName,
          job.location,
          job.description,
          job.requirements,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const matchesEmployment =
        employmentType === "ALL" ||
        job.employmentType === employmentType;

      const matchesWorkMode =
        workMode === "ALL" || job.workMode === workMode;

      return matchesSearch && matchesEmployment && matchesWorkMode;
    });

    result.sort((a, b) => {
      if (sortBy === "OLDEST") {
        return getTimeValue(a.createdAt) - getTimeValue(b.createdAt);
      }

      if (sortBy === "SALARY_HIGH") {
        return (
          Number(b.salaryMax ?? b.salaryMin ?? -1) -
          Number(a.salaryMax ?? a.salaryMin ?? -1)
        );
      }

      if (sortBy === "SALARY_LOW") {
        return (
          Number(a.salaryMin ?? a.salaryMax ?? Infinity) -
          Number(b.salaryMin ?? b.salaryMax ?? Infinity)
        );
      }

      if (sortBy === "DEADLINE") {
        return (
          getTimeValue(a.applicationDeadline) -
          getTimeValue(b.applicationDeadline)
        );
      }

      return getTimeValue(b.createdAt) - getTimeValue(a.createdAt);
    });

    return result;
  }, [openJobs, searchInput, employmentType, workMode, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchInput, employmentType, workMode, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);

  const currentPage = Math.max(
    1,
    Math.min(page, totalPages || 1)
  );

  const visibleJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilters =
    Boolean(searchInput.trim()) ||
    employmentType !== "ALL" ||
    workMode !== "ALL";

  function clearFilters() {
    setSearchInput("");
    setEmploymentType("ALL");
    setWorkMode("ALL");
    setSortBy("NEWEST");
    setPage(1);
  }

  const dashboardLink =
    user?.role === "RECRUITER"
      ? "/recruiter/dashboard"
      : user?.role === "CANDIDATE"
        ? "/candidate/dashboard"
        : "/login";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/jobs"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BriefcaseBusiness size={21} />
            </div>
            Job<span className="text-blue-600">Portal</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={dashboardLink}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              {user ? "Dashboard" : "Login"}
            </Link>

            {user?.role === "CANDIDATE" && (
              <Link
                to="/candidate/applications"
                className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 sm:inline-flex"
              >
                My Applications
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <Sparkles size={14} />
              Discover Opportunities
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find the right job.
              <span className="block text-blue-300">
                Build your future.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore real job openings, compare opportunities
              and take the next step in your career.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span className="text-sm font-bold">
                  {loading ? "..." : openJobs.length} Open Jobs
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                <Building2 size={18} className="text-blue-300" />
                <span className="text-sm font-bold">
                  {loading
                    ? "..."
                    : new Set(
                        openJobs
                          .map((job) => job.companyName)
                          .filter(Boolean)
                      ).size}{" "}
                  Companies
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Search & Filter Jobs
            </h2>
          </div>

          <div className="relative">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search job title, company, skills or location..."
              aria-label="Search jobs"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SelectFilter
              label="Employment Type"
              value={employmentType}
              onChange={setEmploymentType}
              options={EMPLOYMENT_TYPES}
            />

            <SelectFilter
              label="Work Mode"
              value={workMode}
              onChange={setWorkMode}
              options={WORK_MODES}
            />

            <SelectFilter
              label="Sort Jobs"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "NEWEST", label: "Newest First" },
                { value: "OLDEST", label: "Oldest First" },
                { value: "SALARY_HIGH", label: "Highest Salary" },
                { value: "SALARY_LOW", label: "Lowest Salary" },
                { value: "DEADLINE", label: "Deadline: Earliest First" },
              ]}
            />
          </div>

          {activeFilters && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <X size={14} />
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* Results header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Available Opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Fetching opportunities..."
                : `${filteredJobs.length} job${
                    filteredJobs.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadJobs(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white">
            <LoaderCircle
              size={35}
              className="animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Finding available jobs...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-[22px] border border-red-200 bg-white px-6 py-12 text-center"
          >
            <AlertCircle
              size={38}
              className="mx-auto text-red-500"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load jobs
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadJobs()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={31} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-900">
              No jobs found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              {activeFilters
                ? "No jobs match your current search or filters. Try changing your search criteria."
                : "There are no open jobs available right now. Check back later for new opportunities."}
            </p>

            {activeFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Job cards */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-900">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </strong>
                  {" – "}
                  <strong className="text-slate-900">
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredJobs.length
                    )}
                  </strong>
                  {" of "}
                  <strong className="text-slate-900">
                    {filteredJobs.length}
                  </strong>
                  {" jobs"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) =>
                        Math.max(1, previous - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-xs font-bold text-slate-600">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(totalPages, previous + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} JobPortal.
            Find your next opportunity.
          </p>

          <Link
            to={dashboardLink}
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            {user ? "Back to Dashboard" : "Login"}
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default JobsPage;
