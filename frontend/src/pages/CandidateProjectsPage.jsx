
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  GitBranch,
  Globe2,
  Layers3,
  List,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const EMPTY_FORM = {
  projectName: "",
  techStack: "",
  description: "",
  githubUrl: "",
  liveUrl: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function getProjectId(project) {
  return project?.projectId ?? project?.id ?? null;
}

function extractProjects(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.projects)) return data.projects;
  return [];
}

function normalizeProject(project) {
  return {
    projectName: String(project?.projectName ?? ""),
    techStack: String(project?.techStack ?? ""),
    description: String(project?.description ?? ""),
    githubUrl: String(project?.githubUrl ?? ""),
    liveUrl: String(project?.liveUrl ?? ""),
  };
}

function getSkills(value) {
  return String(value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validateProject(form) {
  const errors = {};

  const name = form.projectName.trim();

  if (!name) {
    errors.projectName = "Project name is required.";
  } else if (name.length > 150) {
    errors.projectName = "Maximum 150 characters allowed.";
  }

  if (form.techStack.trim().length > 500) {
    errors.techStack = "Maximum 500 characters allowed.";
  }

  for (const field of ["githubUrl", "liveUrl"]) {
    const value = form[field].trim();

    if (value.length > 500) {
      errors[field] = "Maximum 500 characters allowed.";
    } else if (value && !isValidHttpUrl(value)) {
      errors[field] = "Enter a valid http:// or https:// URL.";
    }
  }

  return errors;
}

function buildPayload(form) {
  return {
    projectName: form.projectName.trim(),
    techStack: form.techStack.trim() || null,
    description: form.description.trim() || null,
    githubUrl: form.githubUrl.trim() || null,
    liveUrl: form.liveUrl.trim() || null,
  };
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  icon: Icon,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        {Icon && <Icon size={16} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputClass} ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
        }`}
      />

      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function DescriptionContent({ description }) {
  const lines = String(description || "").split(/\r?\n/);

  return (
    <div className="space-y-2 text-sm leading-6 text-slate-600">
      {lines.map((line, index) => {
        const text = line.trim();

        if (!text) return null;

        const bullet = /^(?:•|-|\*)\s+/.test(text);

        if (bullet) {
          return (
            <div key={index} className="flex items-start gap-2.5">
              <span className="mt-2.25 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span className="min-w-0 flex-1 wrap-break-word">
                {text.replace(/^(?:•|-|\*)\s+/, "")}
              </span>
            </div>
          );
        }

        return (
          <p key={index} className="wrap-break-word">
            {text}
          </p>
        );
      })}
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const projectId = getProjectId(project);
  const skills = getSkills(project.techStack);

  const githubUrl = String(project.githubUrl || "").trim();
  const liveUrl = String(project.liveUrl || "").trim();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="h-1 bg-linear-to-br from-blue-600 via-indigo-500 to-cyan-400" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 text-blue-600 ring-1 ring-blue-100">
            <Code2 size={24} strokeWidth={2.2} />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onEdit(project)}
              disabled={projectId === null}
              aria-label={`Edit ${project.projectName}`}
              title="Edit project"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600 hover:shadow-sm disabled:opacity-40"
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(project)}
              disabled={projectId === null}
              aria-label={`Delete ${project.projectName}`}
              title="Delete project"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-600 hover:shadow-sm disabled:opacity-40"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        <h3 className="mt-5 wrap-break-word text-xl font-bold tracking-tight text-slate-900">
          {project.projectName}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
          <FileText size={14} />
          Project overview
        </div>

        {project.description ? (
          <div className="mt-3">
            <DescriptionContent description={project.description} />
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400">
            No description added.
          </p>
        )}

        {skills.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Layers3 size={15} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tech Stack
              </span>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {skills.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition group-hover:border-indigo-200"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="break-all">{skill}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            {isValidHttpUrl(githubUrl) && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <GitBranch size={16} />
                Source Code
                <ExternalLink size={13} />
              </a>
            )}

            {isValidHttpUrl(liveUrl) && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                <Globe2 size={16} />
                Live Demo
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function CandidateProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const descriptionRef = useRef(null);
  const formRef = useRef(null);

  const loadProjects = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiRequest("/api/candidate/projects");
      setProjects(extractProjects(response));
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const visibleProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      project.projectName,
      project.techStack,
      project.description,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const allSkills = new Set(
    projects.flatMap((project) => getSkills(project.techStack))
  );

  function scrollToForm() {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openCreateForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    setFormOpen(true);
    scrollToForm();
  }

  function openEditForm(project) {
    const id = getProjectId(project);
    if (id === null) return;

    setForm(normalizeProject(project));
    setEditingId(id);
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    setFormOpen(true);
    scrollToForm();
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFieldErrors({});
    setFormError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setFormError("");
    setSuccess("");
  }

  function insertBullet() {
    const textarea = descriptionRef.current;
    const cursor = textarea?.selectionStart ?? form.description.length;

    const before = form.description.slice(0, cursor);
    const after = form.description.slice(cursor);

    const needsNewLine =
      before.length > 0 && !before.endsWith("\n");

    const insertion = `${needsNewLine ? "\n" : ""}• `;
    const nextValue = before + insertion + after;
    const nextCursor = cursor + insertion.length;

    setForm((previous) => ({
      ...previous,
      description: nextValue,
    }));

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleDescriptionKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) return;

    const textarea = event.currentTarget;
    const cursor = textarea.selectionStart;

    const before = form.description.slice(0, cursor);
    const after = form.description.slice(cursor);

    const line = before.split("\n").at(-1);
    const isBullet = /^\s*•\s/.test(line);

    if (!isBullet) return;

    event.preventDefault();

    const isEmptyBullet = line.trim() === "•";

    let nextValue;
    let nextCursor;

    if (isEmptyBullet) {
      const lineStart = before.lastIndexOf("\n") + 1;
      nextValue =
        before.slice(0, lineStart) + after;
      nextCursor = lineStart;
    } else {
      const insertion = "\n• ";
      nextValue = before + insertion + after;
      nextCursor = cursor + insertion.length;
    }

    setForm((previous) => ({
      ...previous,
      description: nextValue,
    }));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;

    setFormError("");
    setSuccess("");

    const errors = validateProject(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError("Please correct the highlighted fields.");
      return;
    }

    const isEditing = editingId !== null;
    setSaving(true);

    try {
      await apiRequest(
        isEditing
          ? `/api/candidate/projects/${editingId}`
          : "/api/candidate/projects",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(buildPayload(form)),
        }
      );

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setFieldErrors({});
      setFormError("");

      setSuccess(
        isEditing
          ? "Project updated successfully!"
          : "Project added successfully!"
      );

      await loadProjects(true);
    } catch (err) {
      setFormError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(project) {
    if (getProjectId(project) === null) return;

    setDeleteTarget(project);
    setSuccess("");
    setError("");
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    const id = getProjectId(deleteTarget);
    if (id === null) return;

    setDeleting(true);
    setError("");

    try {
      await apiRequest(`/api/candidate/projects/${id}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);
      setSuccess("Project deleted successfully!");
      await loadProjects(true);
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout
      title="My Projects"
      description="Showcase your work, technical skills and real-world experience."
    >
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-20 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Sparkles size={14} />
                Your Developer Portfolio
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Build a portfolio that stands out.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                Organize your best projects, highlight the technologies
                you used, and share working demos with recruiters.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
              >
                <Plus size={18} />
                Add New Project
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Code2 size={19} className="text-blue-300" />
                <p className="mt-4 text-3xl font-bold">
                  {loading ? "—" : projects.length}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Projects
                </p>
              </div>

              <div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Layers3 size={19} className="text-indigo-300" />
                <p className="mt-4 text-3xl font-bold">
                  {loading ? "—" : allSkills.size}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Technologies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
          >
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* Create / Edit Form */}
        {formOpen && (
          <section
            ref={formRef}
            className="scroll-mt-24 overflow-hidden rounded-[22px] border border-blue-200 bg-white shadow-lg shadow-blue-100/30"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-linear-to-r from-blue-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  {editingId !== null ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId !== null
                      ? "Edit Project"
                      : "Add New Project"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Fill in your project details below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              noValidate
              className="space-y-6 p-5 sm:p-7"
            >
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  {formError}
                </div>
              )}

              <TextField
                label="Project Name"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Job Portal Management System"
                icon={Code2}
                error={fieldErrors.projectName}
                required
              />

              <div className="space-y-3">
                <TextField
                  label="Tech Stack / Skills"
                  name="techStack"
                  value={form.techStack}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="Java, Spring Boot, React, MySQL, Tailwind CSS"
                  icon={Layers3}
                  error={fieldErrors.techStack}
                />

                {getSkills(form.techStack).length > 0 && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                      <Sparkles size={14} />
                      Skills Preview
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {getSkills(form.techStack).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                          <span className="break-all">{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  Separate technologies with commas. They will appear
                  as individual badges on your project card.
                </p>
              </div>

              {/* Description editor */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label
                    htmlFor="description"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <FileText size={16} className="text-slate-400" />
                    Project Description
                  </label>

                  <button
                    type="button"
                    onClick={insertBullet}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    <List size={16} />
                    Add Bullet
                  </button>
                </div>

                <textarea
                  ref={descriptionRef}
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  onKeyDown={handleDescriptionKeyDown}
                  rows={7}
                  placeholder={
                    "Briefly describe your project...\n\n• Built a responsive React frontend\n• Developed Spring Boot REST APIs\n• Integrated MySQL database"
                  }
                  className={`${inputClass} resize-y leading-7`}
                />

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Press Enter to continue bullets. Press Enter on an
                  empty bullet to finish the list.
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="GitHub Repository URL"
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="https://github.com/username/repo"
                  icon={GitBranch}
                  error={fieldErrors.githubUrl}
                />

                <TextField
                  label="Live Demo URL"
                  name="liveUrl"
                  value={form.liveUrl}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="https://your-project.com"
                  icon={Globe2}
                  error={fieldErrors.liveUrl}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Project"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* List header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Layers3 size={21} className="text-blue-600" />
              Project Collection
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading your work..."
                : `${projects.length} ${
                    projects.length === 1 ? "project" : "projects"
                  } in your portfolio`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProjects(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Search */}
        {!loading && projects.length > 0 && (
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by project name, technology or description..."
              aria-label="Search projects"
              className={`${inputClass} pl-11`}
            />
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Code2 size={32} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Your portfolio starts here
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              Add your first project and showcase the skills,
              features and technologies you've worked with.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add First Project
              <ChevronRight size={16} />
            </button>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <Search size={28} className="mx-auto text-slate-400" />
            <h3 className="mt-3 font-bold text-slate-900">
              No matching projects
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try another project name or technology.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-bold text-blue-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid items-stretch gap-5 md:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <ProjectCard
                key={getProjectId(project) ?? index}
                project={project}
                onEdit={openEditForm}
                onDelete={requestDelete}
              />
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-project-title"
              aria-describedby="delete-project-description"
              className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-2xl"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={24} />
              </div>

              <h2
                id="delete-project-title"
                className="mt-5 text-xl font-bold text-slate-900"
              >
                Delete this project?
              </h2>

              <p
                id="delete-project-description"
                className="mt-3 wrap-break text-sm leading-7 text-slate-600"
              >
                You're about to permanently delete{" "}
                <strong className="text-slate-900">
                  {deleteTarget.projectName}
                </strong>
                . This action cannot be undone.
              </p>

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={17} />
                  )}
                  {deleting ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CandidateProjectsPage;
