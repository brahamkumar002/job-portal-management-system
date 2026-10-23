
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  Wifi,
} from "lucide-react";

import { apiRequest } from "../services/api";
import { getCurrentUser } from "../services/authService";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));

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

function formatEnum(value) {
  if (!value) return "Not specified";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function todayLocal() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function ContentSection({ title, icon: Icon, content }) {
  const lines = String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <h2 className="text-lg font-extrabold text-slate-900">
          {title}
        </h2>
      </div>

      {lines.length > 0 ? (
        <div className="space-y-3 text-sm leading-7 text-slate-600">
          {lines.map((line, index) => (
            <p key={index} className="whitespace-pre-wrap break-words">
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No additional information provided.
        </p>
      )}
    </section>
  );
}

function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [applyError, setApplyError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const jobData = await apiRequest(`/api/jobs/${jobId}`);
      setJob(jobData);

      let currentUser = null;

      try {
        currentUser = await getCurrentUser();
      } catch {
        currentUser = null;
      }

      setUser(currentUser);

      if (currentUser?.role === "CANDIDATE") {
        try {
          const applicationsData = await apiRequest(
            "/api/candidate/applications"
          );

          const applications = Array.isArray(applicationsData)
            ? applicationsData
            : Array.isArray(applicationsData?.content)
              ? applicationsData.content
              : Array.isArray(applicationsData?.applications)
                ? applicationsData.applications
                : [];

          setAlreadyApplied(
            applications.some(
              (application) =>
                String(application.jobId) === String(jobId)
            )
          );
        } catch {
          setAlreadyApplied(false);
        }
      }
    } catch (err) {
      setError(err.message || "Unable to load job details.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  async function handleApply() {
    if (applying || alreadyApplied || !job) return;

    if (!user) {
      navigate("/login", {
        state: {
          from: `/jobs/${jobId}`,
        },
      });
      return;
    }

    if (user.role !== "CANDIDATE") {
      setApplyError("Only candidates can apply for jobs.");
      return;
    }

    setApplying(true);
    setApplyError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/candidate/applications/jobs/${jobId}`,
        { method: "POST" }
      );

      setAlreadyApplied(true);
      setSuccess("Your application has been submitted successfully!");
    } catch (err) {
      setApplyError(
        err.message || "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  }

  const isOpen = job?.status === "OPEN";
  const deadlinePassed =
    Boolean(job?.applicationDeadline) &&
    job.applicationDeadline < todayLocal();

  const canApply = isOpen && !deadlinePassed;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Browse Jobs
          </Link>

          <Link
            to={
              user?.role === "RECRUITER"
                ? "/recruiter/dashboard"
                : user?.role === "CANDIDATE"
                  ? "/candidate/dashboard"
                  : "/login"
            }
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-96 flex-col items-center justify-center">
            <LoaderCircle
              size={34}
              className="animate-spin text-blue-600"
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading job details...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[22px] border border-red-200 bg-white p-8 text-center">
            <AlertCircle
              size={36}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load job
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadDetails}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Retry
            </button>
          </div>
        ) : job ? (
          <div className="space-y-6">
            {/* Job hero */}
            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-16 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                      <BriefcaseBusiness size={28} />
                    </div>

                    <div className="min-w-0">
                      <h1 className="break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {job.title}
                      </h1>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <Building2 size={17} />
                        {job.companyName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      isOpen
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">
                    <MapPin size={14} className="mr-1 inline" />
                    {job.location}
                  </span>

                  <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">
                    <BriefcaseBusiness size={14} className="mr-1 inline" />
                    {formatEnum(job.employmentType)}
                  </span>

                  <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">
                    <Wifi size={14} className="mr-1 inline" />
                    {formatEnum(job.workMode)}
                  </span>
                </div>
              </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* Main content: Overview → Description → Requirements */}
              <div className="min-w-0 space-y-6">
                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BriefcaseBusiness size={21} />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">Job Overview</h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={Building2}
                      label="Company"
                      value={job.companyName}
                    />

                    <DetailItem
                      icon={MapPin}
                      label="Location"
                      value={job.location}
                    />

                    <DetailItem
                      icon={BriefcaseBusiness}
                      label="Employment Type"
                      value={formatEnum(job.employmentType)}
                    />

                    <DetailItem
                      icon={Wifi}
                      label="Work Mode"
                      value={formatEnum(job.workMode)}
                    />

                    <DetailItem
                      icon={IndianRupee}
                      label="Salary Range"
                      value={formatSalary(
                        job.salaryMin,
                        job.salaryMax
                      )}
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Application Deadline"
                      value={formatDate(job.applicationDeadline)}
                    />

                    <DetailItem
                      icon={Clock3}
                      label="Posted On"
                      value={formatDate(job.createdAt)}
                    />

                    <DetailItem
                      icon={ShieldCheck}
                      label="Job Status"
                      value={formatEnum(job.status)}
                    />
                  </div>
                </section>

                <ContentSection
                  title="Job Description"
                  icon={FileText}
                  content={job.description}
                />

                <ContentSection
                  title="Requirements"
                  icon={CheckCircle2}
                  content={job.requirements}
                />
              </div>

              {/* Apply sidebar */}
              <aside className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Salary Range
                </p>

                <p className="mt-2 break-words text-xl font-extrabold text-slate-900">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>

                <div className="my-5 h-px bg-slate-100" />

                <p className="text-sm font-semibold text-slate-700">
                  Apply Before
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    deadlinePassed ? "text-red-600" : "text-slate-900"
                  }`}
                >
                  {formatDate(job.applicationDeadline)}
                </p>

                {success && (
                  <div
                    role="status"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-700"
                  >
                    <CheckCircle2 size={17} className="shrink-0" />
                    {success}
                  </div>
                )}

                {applyError && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium leading-5 text-red-700"
                  >
                    <AlertCircle size={17} className="shrink-0" />
                    {applyError}
                  </div>
                )}

                {alreadyApplied ? (
                  <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700">
                    <CheckCircle2 size={18} />
                    Already Applied
                  </div>
                ) : !canApply ? (
                  <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-bold text-slate-600">
                    Applications Closed
                  </div>
                ) : user?.role === "RECRUITER" ? (
                  <Link
                    to={`/recruiter/jobs/${job.id}/applications`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    View Applicants
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {applying ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {user ? "Apply Now" : "Login to Apply"}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                )}

                {user?.role === "CANDIDATE" && (
                  <Link
                    to="/candidate/applications"
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                )}

                <p className="mt-5 text-center text-xs leading-6 text-slate-400">
                  Applications are processed securely through
                  the Job Portal.
                </p>
              </aside>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default JobDetailsPage;
