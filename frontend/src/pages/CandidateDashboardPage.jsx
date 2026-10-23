
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.applications)) return data.applications;
  if (Array.isArray(data?.projects)) return data.projects;
  return [];
}

function getJobId(job) {
  return job?.jobId ?? job?.id ?? null;
}

function getApplicationStatus(status) {
  const value = String(status || "PENDING").toUpperCase();

  const colors = {
    PENDING: "bg-amber-50 text-amber-700",
    APPLIED: "bg-blue-50 text-blue-700",
    REVIEWED: "bg-sky-50 text-sky-700",
    SHORTLISTED: "bg-violet-50 text-violet-700",
    INTERVIEW: "bg-indigo-50 text-indigo-700",
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    HIRED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
  };

  return {
    label: value.replaceAll("_", " "),
    className:
      colors[value] || "bg-slate-100 text-slate-700",
  };
}

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SectionHeading({ title, description, link, linkLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          {linkLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function CandidateDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const requests = [
      {
        key: "profile",
        url: "/api/candidate/profile",
      },
      {
        key: "projects",
        url: "/api/candidate/projects",
      },
      {
        key: "applications",
        url: "/api/candidate/applications",
      },
      {
        key: "jobs",
        url: "/api/jobs",
      },
    ];

    const results = await Promise.allSettled(
      requests.map(({ url }) => apiRequest(url))
    );

    const nextErrors = {};

    results.forEach((result, index) => {
      const key = requests[index].key;

      if (result.status === "rejected") {
        const reason = result.reason;
        const status = Number(reason?.status ?? reason?.statusCode ?? reason?.response?.status);
        const message = String(reason?.message || "");

        // A new candidate legitimately has no profile yet.
        if (
          key === "profile" &&
          (status === 404 || /candidate profile not found/i.test(message))
        ) {
          setProfile(null);
          setProfileMissing(true);
          return;
        }

        nextErrors[key] = message || "Failed to load data.";
        return;
      }

      const data = result.value;

      switch (key) {
        case "profile":
          setProfile(data);
          setProfileMissing(data == null);
          break;

        case "projects":
          setProjects(extractItems(data));
          break;

        case "applications":
          setApplications(extractItems(data));
          break;

        case "jobs":
          setJobs(extractItems(data));
          break;

        default:
          break;
      }
    });

    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      await loadDashboard();

      if (!active) return;
    }

    initialize();

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const openJobs = jobs.filter(
    (job) =>
      String(job?.status || "").toUpperCase() === "OPEN"
  );

  const recentApplications = [...applications]
    .sort((a, b) => {
      const aDate = new Date(
        a.appliedAt || a.createdAt || 0
      ).getTime();

      const bDate = new Date(
        b.appliedAt || b.createdAt || 0
      ).getTime();

      return bDate - aDate;
    })
    .slice(0, 4);

  const recentJobs = [...openJobs]
    .sort((a, b) => {
      const aDate = new Date(
        a.createdAt || a.postedAt || 0
      ).getTime();

      const bDate = new Date(
        b.createdAt || b.postedAt || 0
      ).getTime();

      return bDate - aDate;
    })
    .slice(0, 3);

 const profileFields = [
  profile?.phone,
  profile?.gender,
  profile?.city,
  profile?.state,
  profile?.qualification,
  profile?.specialization,
  profile?.collegeName,
  profile?.graduationYear,
  profile?.cgpa,
  profile?.experienceLevel,
  profile?.yearsOfExperience,
  profile?.currentJobTitle,
  profile?.preferredJobLocation,
  profile?.noticePeriod,
  profile?.technicalSkills,
  profile?.resumeUrl,
  profile?.linkedinUrl,
  profile?.githubUrl,
  profile?.portfolioUrl,
];

  const profileCompletion = profile
    ? Math.round(
        (profileFields.filter((value) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }

          return (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
          );
        }).length /
          profileFields.length) *
          100
      )
    : 0;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <DashboardLayout
      title="Candidate Dashboard"
      description="Manage your profile, applications and career opportunities."
    >
      <div className="space-y-6">
        {/* Refresh action */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* API errors */}
        {hasErrors && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-800">
                  Some information could not be loaded
                </p>

                <div className="mt-2 space-y-1 text-sm text-red-700">
                  {Object.entries(errors).map(
                    ([section, message]) => (
                      <p key={section}>
                        <span className="font-semibold capitalize">
                          {section}:
                        </span>{" "}
                        {message}
                      </p>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 underline"
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="My Applications"
            value={
              loading || errors.applications
                ? "—"
                : applications.length
            }
            icon={FileText}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="My Projects"
            value={
              loading || errors.projects
                ? "—"
                : projects.length
            }
            icon={Code2}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            label="Open Jobs"
            value={
              loading || errors.jobs
                ? "—"
                : openJobs.length
            }
            icon={BriefcaseBusiness}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Profile Progress"
            value={
              loading || errors.profile
                ? "—"
                : `${profileCompletion}%`
            }
            icon={UserRound}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Profile completion */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Profile Overview"
            description="A complete profile helps recruiters understand your skills."
            link="/candidate/profile"
            linkLabel="Manage Profile"
          />

          {loading ? (
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ) : errors.profile ? (
            <p className="text-sm text-red-600">
              Profile information is unavailable.
            </p>
          ) : profileMissing ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                  <UserRound size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">Complete Your Profile</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Welcome! Add your education, skills and contact details so recruiters can learn more about you.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blue-700">Profile completion: 0%</p>
                  <div
                    role="progressbar"
                    aria-label="Profile completion"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={0}
                    className="mt-2 h-2.5 overflow-hidden rounded-full bg-blue-100"
                  />
                  <Link
                    to="/candidate/profile"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Complete Your Profile <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                  Profile completion
                </p>

                <span className="text-sm font-bold text-blue-600">
                  {profileCompletion}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={profileCompletion}
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-4 flex items-start gap-2 text-sm text-slate-500">
                {profileCompletion === 100 ? (
                  <>
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-600"
                    />
                    Your profile details are complete.
                  </>
                ) : (
                  <>
                    <UserRound
                      size={18}
                      className="shrink-0 text-blue-600"
                    />
                    Update your profile details to improve your
                    completion score.
                  </>
                )}
              </p>
            </>
          )}
        </section>

        {/* Recent applications */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Recent Applications"
            description="Track the progress of jobs you've applied for."
            link="/candidate/applications"
            linkLabel="View All"
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : errors.applications ? (
            <p className="text-sm text-red-600">
              Applications could not be loaded.
            </p>
          ) : recentApplications.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
              <FileText
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-semibold text-slate-800">
                No applications yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Explore available jobs and apply to get started.
              </p>

              <Link
                to="/jobs"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                Browse Jobs
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((application, index) => {
                const status = getApplicationStatus(
                  application.status
                );

                return (
                  <div
                    key={
                      application.applicationId ??
                      application.id ??
                      index
                    }
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {application.jobTitle ||
                          application.job?.title ||
                          "Job application"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {application.companyName ||
                          application.job?.companyName ||
                          "Submitted application"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Latest jobs */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Latest Open Jobs"
            description="Discover opportunities currently accepting applications."
            link="/jobs"
            linkLabel="Browse All"
          />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : errors.jobs ? (
            <p className="text-sm text-red-600">
              Job listings could not be loaded.
            </p>
          ) : recentJobs.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
              <BriefcaseBusiness
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-semibold text-slate-800">
                No open jobs available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New opportunities will appear here when posted.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentJobs.map((job, index) => {
                const jobId = getJobId(job);

                return (
                  <div
                    key={jobId ?? index}
                    className="flex flex-col rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BriefcaseBusiness size={21} />
                    </div>

                    <h3 className="line-clamp-2 font-bold text-slate-900">
                      {job.title || "Job"}
                    </h3>

                    {job.companyName && (
                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      {job.location && (
                        <p className="flex items-center gap-2">
                          <MapPin size={15} />
                          {job.location}
                        </p>
                      )}

                      {job.jobType && (
                        <p className="flex items-center gap-2">
                          <Clock3 size={15} />
                          {String(job.jobType).replaceAll(
                            "_",
                            " "
                          )}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Open
                      </span>

                      {jobId !== null && (
                        <Link
                          to={`/jobs/${jobId}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Details
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default CandidateDashboardPage;
