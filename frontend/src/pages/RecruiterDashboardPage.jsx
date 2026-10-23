
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const STATUS_STYLES = {
  OPEN: {
    label: "Open",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

function extractItems(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.[key])) return data[key];
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

function formatEnum(value) {
  if (!value) return "Not specified";

  return String(value)
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

function formatSalary(min, max) {
  const hasMin =
    min !== null &&
    min !== undefined &&
    min !== "";

  const hasMax =
    max !== null &&
    max !== undefined &&
    max !== "";

  if (!hasMin && !hasMax) {
    return "Not disclosed";
  }

  const currency = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  });

  if (hasMin && hasMax) {
    return `${currency.format(Number(min))} – ${currency.format(
      Number(max)
    )}`;
  }

  if (hasMin) {
    return `From ${currency.format(Number(min))}`;
  }

  return `Up to ${currency.format(Number(max))}`;
}

function getTimestamp(value) {
  if (!value) return 0;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function isDeadlinePassed(deadline) {
  if (!deadline) return false;

  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return deadline < localToday;
}

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: formatEnum(status),
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
    icon: Clock3,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>

        <TrendingUp
          size={17}
          className="text-slate-300"
        />
      </div>

      <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <h3 className="mt-1 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function JobCard({
  job,
  applicationCount,
  applicationsLoaded,
}) {
  const deadlinePassed = isDeadlinePassed(
    job.applicationDeadline
  );

  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold text-slate-900">
                {job.title}
              </h3>

              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Building2 size={14} className="shrink-0" />
                <span className="break-words">
                  {job.companyName}
                </span>
              </p>
            </div>
          </div>

          <StatusBadge status={job.status} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <MapPin size={14} />
            {job.location || "Not specified"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <BriefcaseBusiness size={14} />
            {formatEnum(job.employmentType)}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <LayoutDashboard size={14} />
            {formatEnum(job.workMode)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarDays size={14} />
              Application Deadline
            </p>

            <p
              className={`mt-1 text-sm font-bold ${
                deadlinePassed
                  ? "text-red-600"
                  : "text-slate-800"
              }`}
            >
              {formatDate(job.applicationDeadline)}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Users size={14} />
              Applications Received
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {applicationsLoaded
                ? applicationCount
                : "Unavailable"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Posted {formatDate(job.createdAt)}
          </p>

          <Link
            to={`/recruiter/jobs/${job.id}/applications`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            View Applications
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [applicationCounts, setApplicationCounts] =
    useState({});
  const [failedApplicationJobs, setFailedApplicationJobs] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const jobData = await apiRequest(
        "/api/recruiter/jobs"
      );

      const recruiterJobs = extractItems(jobData, "jobs");
      setJobs(recruiterJobs);

      const results = await Promise.allSettled(
        recruiterJobs.map((job) =>
          apiRequest(
            `/api/recruiter/jobs/${job.id}/applications`
          )
        )
      );

      const counts = {};
      const failedIds = [];

      results.forEach((result, index) => {
        const jobId = recruiterJobs[index].id;

        if (result.status === "fulfilled") {
          counts[jobId] = extractItems(
            result.value,
            "applications"
          ).length;
        } else {
          failedIds.push(jobId);
        }
      });

      setApplicationCounts(counts);
      setFailedApplicationJobs(failedIds);
    } catch (err) {
      setError(
        err.message || "Unable to load recruiter dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const openJobs = jobs.filter(
      (job) => job.status === "OPEN"
    ).length;

    const closedJobs = jobs.filter(
      (job) => job.status === "CLOSED"
    ).length;

    const totalApplications = Object.values(
      applicationCounts
    ).reduce((sum, count) => sum + count, 0);

    return {
      totalJobs: jobs.length,
      openJobs,
      closedJobs,
      totalApplications,
    };
  }, [jobs, applicationCounts]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          getTimestamp(b.createdAt) -
          getTimestamp(a.createdAt)
      )
      .slice(0, 4);
  }, [jobs]);

  const applicationsComplete =
    failedApplicationJobs.length === 0;

  return (
    <DashboardLayout
      title="Recruiter Dashboard"
      description="Manage your job postings and monitor candidate applications."
    >
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Sparkles size={14} />
                Recruitment Overview
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Find great talent, faster.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Keep track of your job openings, review
                applications, and manage your recruitment
                process in one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/recruiter/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
                >
                  <Plus size={18} />
                  Post New Job
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/recruiter/jobs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <BriefcaseBusiness size={18} />
                  Manage Jobs
                </Link>
              </div>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-blue-200 sm:h-24 sm:w-24">
              <Users size={40} strokeWidth={1.6} />
            </div>
          </div>
        </section>

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
              onClick={() => loadDashboard(true)}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Total Jobs"
            value={loading ? "—" : stats.totalJobs}
            icon={BriefcaseBusiness}
            iconClass="bg-indigo-50 text-indigo-600"
            description="All jobs you've posted"
          />

          <StatCard
            title="Open Jobs"
            value={loading ? "—" : stats.openJobs}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
            description="Currently accepting applications"
          />

          <StatCard
            title="Closed Jobs"
            value={loading ? "—" : stats.closedJobs}
            icon={XCircle}
            iconClass="bg-slate-100 text-slate-600"
            description="Closed job listings"
          />

          <StatCard
            title="Applications"
            value={
              loading
                ? "—"
                : applicationsComplete
                  ? stats.totalApplications
                  : "—"
            }
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            description={
              applicationsComplete
                ? "Applications across your jobs"
                : "Some application counts unavailable"
            }
          />
        </div>

        {!loading && failedApplicationJobs.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>
              Application counts could not be loaded for{" "}
              {failedApplicationJobs.length}{" "}
              {failedApplicationJobs.length === 1
                ? "job"
                : "jobs"}
              . Refresh to try again.
            </p>
          </div>
        )}

        {/* Recent jobs */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <LayoutDashboard
                  size={21}
                  className="text-blue-600"
                />
                Recent Job Postings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest recruitment opportunities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {refreshing ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh
              </button>

              <Link
                to="/recruiter/jobs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Inbox size={32} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No jobs posted yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                Create your first job listing to start
                connecting with potential candidates.
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
          ) : (
            <div className="grid items-stretch gap-5 xl:grid-cols-2">
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applicationCount={applicationCounts[job.id] ?? 0}
                  applicationsLoaded={
                    Object.prototype.hasOwnProperty.call(
                      applicationCounts,
                      job.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump straight into your recruitment workflow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/recruiter/jobs/new"
              className="group flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Plus size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  Post a New Job
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Publish a new opportunity
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-blue-600 transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/recruiter/jobs"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  Manage Job Listings
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Review and update posted jobs
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-indigo-600 transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterDashboardPage;
