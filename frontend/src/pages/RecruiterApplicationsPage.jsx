
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Applications" },
  { value: "APPLIED", label: "Applied" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_CONFIG = {
  APPLIED: {
    label: "Applied",
    icon: Clock3,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function extractApplications(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.applications)) return data.applications;
  return [];
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

function formatValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function safeExternalUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.APPLIED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          tones[tone] || tones.blue
        }`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-4 text-3xl font-extrabold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-bold text-slate-800">
        {formatValue(value)}
      </p>
    </div>
  );
}

function ExternalLinkButton({ href, icon: Icon, children }) {
  const safeUrl = safeExternalUrl(href);

  if (!safeUrl) return null;

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
    >
      <Icon size={17} />
      {children}
      <ExternalLink size={14} />
    </a>
  );
}

function ApplicantCard({
  application,
  onViewProfile,
  onStatusChange,
  updating,
}) {
  const status = application.status || "APPLIED";
  const canReview = status === "APPLIED";

  const candidateName =
    application.candidateName || "Unknown Candidate";

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 font-extrabold text-blue-700">
            {initials || <UserRound size={22} />}
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-lg font-extrabold text-slate-900">
              {candidateName}
            </h3>

            {application.candidateEmail && (
              <a
                href={`mailto:${application.candidateEmail}`}
                className="mt-1 inline-flex items-center gap-1.5 break-all text-sm text-slate-500 hover:text-blue-600"
              >
                <Mail size={15} className="shrink-0" />
                {application.candidateEmail}
              </a>
            )}
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            Application ID
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            #{application.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400">
            Candidate ID
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            #{application.candidateId}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CalendarDays size={13} />
            Applied On
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatDate(application.appliedAt)}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock3 size={13} />
            Last Updated
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatDate(application.updatedAt)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewProfile(application)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100"
      >
        <UserRound size={17} />
        View Full Candidate Profile
        <ArrowRight size={16} />
      </button>

      {canReview ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              onStatusChange(application, "SHORTLISTED")
            }
            disabled={updating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {updating ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Check size={17} />
            )}
            Shortlist
          </button>

          <button
            type="button"
            onClick={() =>
              onStatusChange(application, "REJECTED")
            }
            disabled={updating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <XCircle size={17} />
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
          <ShieldCheck size={16} />
          Application reviewed. Status cannot be changed again.
        </div>
      )}
    </article>
  );
}

function CandidateProfileModal({
  application,
  details,
  loading,
  error,
  onClose,
  onRetry,
  onStatusChange,
  updating,
}) {
  if (!application) return null;

  const profile = details?.profile;
  const projects = Array.isArray(details?.projects)
    ? details.projects
    : [];

  const canReview = application.status === "APPLIED";

  const skills = String(profile?.technicalSkills || "")
    .split(/[,;\n]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-profile-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Candidate Profile
            </p>

            <h2
              id="candidate-profile-title"
              className="mt-1 break-words text-xl font-extrabold text-slate-900 sm:text-2xl"
            >
              {application.candidateName || "Candidate Details"}
            </h2>

            <p className="mt-1 break-all text-sm text-slate-500">
              {application.candidateEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center">
              <LoaderCircle
                size={35}
                className="animate-spin text-blue-600"
              />
              <p className="mt-4 text-sm text-slate-500">
                Loading complete candidate profile...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle
                size={36}
                className="mx-auto text-red-500"
              />
              <p className="mt-4 text-sm font-semibold text-red-600">
                {error}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : details ? (
            <div className="space-y-7">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={details.status} />

                <span className="text-xs font-semibold text-slate-500">
                  Applied: {formatDate(details.appliedAt)}
                </span>
              </div>

              {/* Personal */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <UserRound size={19} className="text-blue-600" />
                  Personal Information
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem
                    label="Full Name"
                    value={details.candidateName}
                  />
                  <DetailItem
                    label="Email"
                    value={details.candidateEmail}
                    icon={Mail}
                  />
                  <DetailItem
                    label="Phone"
                    value={profile?.phone}
                    icon={Phone}
                  />
                  <DetailItem
                    label="City"
                    value={profile?.city}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="State"
                    value={profile?.state}
                  />
                  <DetailItem
                    label="Gender"
                    value={profile?.gender}
                  />
                </div>
              </section>

              {/* Education */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <GraduationCap
                    size={20}
                    className="text-blue-600"
                  />
                  Education
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem
                    label="Qualification"
                    value={profile?.qualification}
                  />
                  <DetailItem
                    label="Specialization"
                    value={profile?.specialization}
                  />
                  <DetailItem
                    label="College"
                    value={profile?.collegeName}
                  />
                  <DetailItem
                    label="Graduation Year"
                    value={profile?.graduationYear}
                  />
                  <DetailItem
                    label="CGPA"
                    value={profile?.cgpa}
                  />
                </div>
              </section>

              {/* Experience */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <BriefcaseBusiness
                    size={19}
                    className="text-blue-600"
                  />
                  Professional Experience
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem
                    label="Experience Level"
                    value={
                      profile?.experienceLevel === "FRESHER"
                        ? "Fresher"
                        : profile?.experienceLevel === "EXPERIENCED"
                          ? "Experienced"
                          : null
                    }
                  />
                  <DetailItem
                    label="Years of Experience"
                    value={
                      profile?.yearsOfExperience != null
                        ? `${profile.yearsOfExperience} years`
                        : null
                    }
                  />
                  <DetailItem
                    label="Current Job Title"
                    value={profile?.currentJobTitle}
                  />
                  <DetailItem
                    label="Preferred Location"
                    value={profile?.preferredJobLocation}
                  />
                  <DetailItem
                    label="Notice Period"
                    value={profile?.noticePeriod}
                  />
                </div>
              </section>

              {/* Skills */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <BookOpen size={19} className="text-blue-600" />
                  Technical Skills
                </h3>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Technical skills not provided.
                  </p>
                )}
              </section>

              {/* Resume and social */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <FileText size={19} className="text-blue-600" />
                  Resume & Professional Links
                </h3>

                <div className="flex flex-wrap gap-2">
                  <ExternalLinkButton
                    href={profile?.resumeUrl}
                    icon={FileText}
                  >
                    View Resume
                  </ExternalLinkButton>

                  <ExternalLinkButton
                    href={profile?.linkedinUrl}
                    icon={UserRound}
                  >
                    LinkedIn
                  </ExternalLinkButton>

                  <ExternalLinkButton
                    href={profile?.githubUrl}
                    icon={FolderGit2}
                  >
                    GitHub
                  </ExternalLinkButton>

                  <ExternalLinkButton
                    href={profile?.portfolioUrl}
                    icon={ExternalLink}
                  >
                    Portfolio
                  </ExternalLinkButton>
                </div>

                {![
                  profile?.resumeUrl,
                  profile?.linkedinUrl,
                  profile?.githubUrl,
                  profile?.portfolioUrl,
                ].some(safeExternalUrl) && (
                  <p className="text-sm text-slate-500">
                    No valid resume or professional links provided.
                  </p>
                )}
              </section>

              {/* Projects */}
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <FolderGit2
                      size={19}
                      className="text-blue-600"
                    />
                    Candidate Projects
                  </h3>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {projects.length} Projects
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                    No projects added by this candidate.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <h4 className="break-words text-base font-extrabold text-slate-900">
                          {project.projectName}
                        </h4>

                        {project.techStack && (
                          <p className="mt-2 break-words text-xs font-bold text-blue-600">
                            {project.techStack}
                          </p>
                        )}

                        {project.description && (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                            {project.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <ExternalLinkButton
                            href={project.githubUrl}
                            icon={FolderGit2}
                          >
                            GitHub
                          </ExternalLinkButton>

                          <ExternalLinkButton
                            href={project.liveUrl}
                            icon={ExternalLink}
                          >
                            Live Demo
                          </ExternalLinkButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>

        {/* Modal footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          {details && !loading && !error && canReview && (
            <>
              <button
                type="button"
                onClick={() =>
                  onStatusChange(application, "REJECTED")
                }
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={16} />
                Reject
              </button>

              <button
                type="button"
                onClick={() =>
                  onStatusChange(application, "SHORTLISTED")
                }
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check size={16} />
                Shortlist
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  application,
  nextStatus,
  updating,
  onCancel,
  onConfirm,
}) {
  if (!application || !nextStatus) return null;

  const isReject = nextStatus === "REJECTED";
  const actionLabel = isReject ? "Reject" : "Shortlist";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-status-title"
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isReject
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {isReject ? (
            <XCircle size={25} />
          ) : (
            <CheckCircle2 size={25} />
          )}
        </div>

        <h2
          id="confirm-status-title"
          className="mt-5 text-xl font-extrabold text-slate-900"
        >
          {actionLabel} Candidate?
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Are you sure you want to{" "}
          <strong className="text-slate-900">
            {actionLabel.toLowerCase()}
          </strong>{" "}
          <strong className="text-slate-900">
            {application.candidateName || "this candidate"}
          </strong>
          ?
        </p>

        <p className="mt-2 text-xs font-semibold leading-6 text-amber-700">
          This action is final. Your backend does not allow
          changing the status again after review.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={updating}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={updating}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60 ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {updating ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Check size={17} />
                Confirm {actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecruiterApplicationsPage() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const applicationsData = await apiRequest(
          `/api/recruiter/jobs/${jobId}/applications`
        );

        setApplications(extractApplications(applicationsData));

        try {
          const jobData = await apiRequest(`/api/jobs/${jobId}`);
          setJob(jobData);
        } catch {
          setJob(null);
        }
      } catch (err) {
        setError(
          err.message || "Unable to load applications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const loadCandidateDetails = useCallback(async (applicationId) => {
    setDetailsLoading(true);
    setDetailsError("");
    setCandidateDetails(null);

    try {
      const data = await apiRequest(
        `/api/recruiter/applications/${applicationId}/candidate-details`
      );

      setCandidateDetails(data);
    } catch (err) {
      setDetailsError(
        err.message || "Unable to load candidate profile."
      );
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  function viewCandidateProfile(application) {
    setSelectedApplication(application);
    loadCandidateDetails(application.id);
  }

  function closeCandidateProfile() {
    if (updatingId !== null) return;

    setSelectedApplication(null);
    setCandidateDetails(null);
    setDetailsError("");
  }

  const stats = useMemo(
    () => ({
      total: applications.length,
      applied: applications.filter(
        (item) => item.status === "APPLIED"
      ).length,
      shortlisted: applications.filter(
        (item) => item.status === "SHORTLISTED"
      ).length,
      rejected: applications.filter(
        (item) => item.status === "REJECTED"
      ).length,
    }),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = applications.filter((application) => {
      const matchesSearch =
        !query ||
        [
          application.candidateName,
          application.candidateEmail,
          application.id,
          application.candidateId,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const date = (value) => {
        const time = new Date(value || 0).getTime();
        return Number.isFinite(time) ? time : 0;
      };

      if (sortBy === "OLDEST") {
        return date(a.appliedAt) - date(b.appliedAt);
      }

      if (sortBy === "UPDATED") {
        return date(b.updatedAt) - date(a.updatedAt);
      }

      if (sortBy === "NAME") {
        return String(a.candidateName || "").localeCompare(
          String(b.candidateName || "")
        );
      }

      return date(b.appliedAt) - date(a.appliedAt);
    });

    return result;
  }, [applications, search, statusFilter, sortBy]);

  function requestStatusChange(application, status) {
    if (updatingId !== null) return;
    if (application.status !== "APPLIED") return;

    setError("");
    setSuccess("");
    setPendingUpdate({ application, status });
  }

  async function confirmStatusChange() {
    if (!pendingUpdate || updatingId !== null) return;

    const { application, status } = pendingUpdate;

    setUpdatingId(application.id);
    setError("");
    setSuccess("");

    try {
      const updatedApplication = await apiRequest(
        `/api/recruiter/applications/${application.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      setApplications((previous) =>
        previous.map((item) =>
          String(item.id) === String(application.id)
            ? updatedApplication
            : item
        )
      );

      setSelectedApplication((previous) =>
        previous?.id === application.id
          ? updatedApplication
          : previous
      );

      setCandidateDetails((previous) =>
        previous?.applicationId === application.id
          ? { ...previous, status: updatedApplication.status }
          : previous
      );

      setSuccess(
        `${application.candidateName || "Candidate"} has been ${
          status === "SHORTLISTED" ? "shortlisted" : "rejected"
        } successfully.`
      );

      setPendingUpdate(null);
    } catch (err) {
      setPendingUpdate(null);
      setError(
        err.message || "Unable to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const hasFilters =
    Boolean(search.trim()) || statusFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setSortBy("NEWEST");
  }

  return (
    <DashboardLayout
      title="Job Applications"
      description="Review complete candidate profiles before making hiring decisions."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={17} />
            Back to My Jobs
          </Link>

          <Link
            to={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            View Job Details
            <ArrowRight size={16} />
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <ShieldCheck size={14} />
              Recruitment Management
            </span>

            <h2 className="mt-5 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
              {job?.title || "Manage Applicants"}
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              {job?.companyName
                ? `${job.companyName} · Job #${jobId}`
                : `Job #${jobId}`}
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Review qualifications, experience, technical skills,
              resumes and projects before shortlisting candidates.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <Users size={18} className="text-blue-300" />
              <span className="text-sm font-bold">
                {loading ? "..." : stats.total} Total Applicants
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Applications"
            value={loading ? "—" : stats.total}
            tone="violet"
          />
          <StatCard
            icon={Clock3}
            label="Applied"
            value={loading ? "—" : stats.applied}
            tone="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Shortlisted"
            value={loading ? "—" : stats.shortlisted}
            tone="emerald"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={loading ? "—" : stats.rejected}
            tone="red"
          />
        </div>

        {success && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2
                size={19}
                className="shrink-0 text-emerald-600"
              />
              <p className="text-sm font-semibold text-emerald-700">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                size={19}
                className="shrink-0 text-red-600"
              />
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={19}
                className="text-blue-600"
              />
              <h3 className="font-extrabold text-slate-900">
                Find Applicants
              </h3>
            </div>

            <button
              type="button"
              onClick={() => loadApplications(true)}
              disabled={loading || refreshing || updatingId !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_180px]">
            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or candidate ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="UPDATED">Recently Updated</option>
                <option value="NAME">Candidate Name</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Applicant List
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading candidates..."
                : `${filteredApplications.length} candidate(s) found`}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white">
              <LoaderCircle
                size={34}
                className="animate-spin text-blue-600"
              />
              <p className="mt-4 text-sm text-slate-500">
                Loading applications...
              </p>
            </div>
          ) : error && applications.length === 0 ? (
            <div className="rounded-[22px] border border-red-200 bg-white px-6 py-12 text-center">
              <AlertCircle
                size={36}
                className="mx-auto text-red-500"
              />
              <h4 className="mt-4 font-extrabold text-slate-900">
                Unable to load applications
              </h4>
              <button
                type="button"
                onClick={() => loadApplications()}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-14 text-center">
              <Users
                size={36}
                className="mx-auto text-blue-500"
              />
              <h4 className="mt-4 text-lg font-extrabold text-slate-900">
                {hasFilters
                  ? "No matching applicants"
                  : "No applications yet"}
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                {hasFilters
                  ? "Try different search or filter options."
                  : "Applications will appear here when candidates apply."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredApplications.map((application) => (
                <ApplicantCard
                  key={application.id}
                  application={application}
                  onViewProfile={viewCandidateProfile}
                  onStatusChange={requestStatusChange}
                  updating={updatingId === application.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <CandidateProfileModal
        application={selectedApplication}
        details={candidateDetails}
        loading={detailsLoading}
        error={detailsError}
        onClose={closeCandidateProfile}
        onRetry={() =>
          selectedApplication &&
          loadCandidateDetails(selectedApplication.id)
        }
        onStatusChange={requestStatusChange}
        updating={updatingId !== null}
      />

      <ConfirmationModal
        application={pendingUpdate?.application}
        nextStatus={pendingUpdate?.status}
        updating={updatingId !== null}
        onCancel={() => {
          if (updatingId === null) setPendingUpdate(null);
        }}
        onConfirm={confirmStatusChange}
      />
    </DashboardLayout>
  );
}

export default RecruiterApplicationsPage;
