
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  IndianRupee,
  Info,
  Laptop,
  List,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Type,
  X,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const INITIAL_FORM = {
  title: "",
  companyName: "",
  description: "",
  requirements: "",
  location: "",
  employmentType: "",
  workMode: "",
  salaryMin: "",
  salaryMax: "",
  applicationDeadline: "",
};

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

const WORK_MODES = [
  { value: "ONSITE", label: "Onsite" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function getTodayLocal() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatINR(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? INR_FORMATTER.format(amount)
    : "";
}

function validateSalary(value, fieldName) {
  if (value === "") return "";

  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
    return `${fieldName} must have up to 10 digits and 2 decimal places.`;
  }

  if (!Number.isFinite(Number(value)) || Number(value) < 0) {
    return `${fieldName} must be zero or greater.`;
  }

  return "";
}

function validateForm(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = "Job title is required.";
  } else if (form.title.trim().length > 150) {
    errors.title = "Job title cannot exceed 150 characters.";
  }

  if (!form.companyName.trim()) {
    errors.companyName = "Company name is required.";
  } else if (form.companyName.trim().length > 150) {
    errors.companyName =
      "Company name cannot exceed 150 characters.";
  }

  if (!form.description.trim()) {
    errors.description = "Job description is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Job location is required.";
  } else if (form.location.trim().length > 150) {
    errors.location = "Location cannot exceed 150 characters.";
  }

  if (!EMPLOYMENT_TYPES.some((item) => item.value === form.employmentType)) {
    errors.employmentType = "Select an employment type.";
  }

  if (!WORK_MODES.some((item) => item.value === form.workMode)) {
    errors.workMode = "Select a work mode.";
  }

  const minError = validateSalary(form.salaryMin, "Minimum salary");
  const maxError = validateSalary(form.salaryMax, "Maximum salary");

  if (minError) errors.salaryMin = minError;
  if (maxError) errors.salaryMax = maxError;

  if (
    !minError &&
    !maxError &&
    form.salaryMin !== "" &&
    form.salaryMax !== "" &&
    Number(form.salaryMax) < Number(form.salaryMin)
  ) {
    errors.salaryMax =
      "Maximum salary must be greater than or equal to minimum salary.";
  }

  if (!form.applicationDeadline) {
    errors.applicationDeadline = "Application deadline is required.";
  } else if (form.applicationDeadline < getTodayLocal()) {
    errors.applicationDeadline =
      "Application deadline cannot be in the past.";
  }

  return errors;
}

function SectionHeading({ icon: Icon, title, description, number }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {number}
          </span>
        </div>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  required = false,
  maxLength,
  type = "text",
  min,
  step,
  hint,
}) {
  const inputId = `job-${name}`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          step={step}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl border bg-slate-50 py-3.5 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${Icon ? "pl-11" : "pl-4"
            } ${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
        />
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  icon: Icon,
  placeholder,
}) {
  const inputId = `job-${name}`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-700"
      >
        {label}
        <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full appearance-none rounded-xl border bg-slate-50 py-3.5 pl-11 pr-10 text-sm outline-none transition focus:bg-white focus:ring-4 ${!value ? "text-slate-400" : "text-slate-900"
            } ${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

function TextEditor({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  rows = 6,
  textareaRef,
}) {
  const inputId = `job-${name}`;

  function insertBullet() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = value.slice(0, start);
    const after = value.slice(end);

    const prefix =
      start === 0 || before.endsWith("\n")
        ? "• "
        : "\n• ";

    const nextValue = before + prefix + after;
    const nextPosition = start + prefix.length;

    onChange({
      target: {
        name,
        value: nextValue,
      },
    });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter") return;

    const textarea = event.currentTarget;
    const cursor = textarea.selectionStart;
    const before = value.slice(0, cursor);
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);

    if (!currentLine.startsWith("• ")) return;

    event.preventDefault();

    const after = value.slice(textarea.selectionEnd);

    if (currentLine === "• ") {
      const nextValue =
        value.slice(0, lineStart) + after;

      onChange({
        target: { name, value: nextValue },
      });

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart);
      });

      return;
    }

    const nextValue = before + "\n• " + after;
    const nextPosition = cursor + 3;

    onChange({
      target: { name, value: nextValue },
    });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-700"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>

        <button
          type="button"
          onClick={insertBullet}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <List size={14} />
          Add Bullet
        </button>
      </div>

      <textarea
        ref={textareaRef}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full resize-y rounded-xl border bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
          }`}
      />

      {error ? (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle size={13} />
          {error}
        </p>
      ) : (
        <p className="text-xs text-slate-400">
          Use the bullet button to organize your content.
          Press Enter to continue a bullet list.
        </p>
      )}
    </div>
  );
}

function CreateJobPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const descriptionRef = useRef(null);
  const requirementsRef = useRef(null);
  const formRef = useRef(null);

  const today = getTodayLocal();

  const filledRequiredFields = [
    form.title.trim(),
    form.companyName.trim(),
    form.description.trim(),
    form.location.trim(),
    form.employmentType,
    form.workMode,
    form.applicationDeadline,
  ].filter(Boolean).length;

  const completion = Math.round(
    (filledRequiredFields / 7) * 100
  );

  const hasFormChanges = Object.keys(INITIAL_FORM).some(
    (key) => form[key] !== INITIAL_FORM[key]
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => {
      if (!previous[name] && name !== "salaryMin") {
        return previous;
      }

      const next = { ...previous };
      delete next[name];

      if (name === "salaryMin" || name === "salaryMax") {
        delete next.salaryMax;
      }

      return next;
    });

    if (serverError) setServerError("");
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setServerError("");
    setShowResetConfirm(false);
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setServerError("");

    if (Object.keys(validationErrors).length > 0) {
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector(
          '[aria-invalid="true"]'
        );

        firstInvalid?.focus();
      });

      return;
    }

    const payload = {
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      location: form.location.trim(),
      employmentType: form.employmentType,
      workMode: form.workMode,
      salaryMin:
        form.salaryMin === "" ? null : Number(form.salaryMin),
      salaryMax:
        form.salaryMax === "" ? null : Number(form.salaryMax),
      applicationDeadline: form.applicationDeadline,
    };

    setSaving(true);

    try {
      await apiRequest("/api/recruiter/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      navigate("/recruiter/jobs", {
        replace: true,
        state: {
          successMessage: `Job "${payload.title}" posted successfully.`,
        },
      });
    } catch (err) {
      setServerError(
        err.message || "Unable to create the job. Please try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      title="Post New Job"
      description="Create a professional job listing and start attracting candidates."
    >
      <div ref={formRef} className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-xl">
              <Link
                to="/recruiter/jobs"
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 transition hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to Jobs
              </Link>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Sparkles size={14} />
                Create Opportunity
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Build your next great team.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Share the right details to help qualified candidates
                discover your opportunity.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-200 sm:h-20 sm:w-20">
              <BriefcaseBusiness size={32} />
            </div>
          </div>
        </section>

        {/* Form progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Listing Completion
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Complete all required fields before publishing.
              </p>
            </div>

            <span className="text-xl font-extrabold text-blue-600">
              {completion}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Required fields completion"
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {filledRequiredFields} of 7 required fields completed
          </p>
        </section>

        {/* Backend error */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6"
        >
          {/* Basic details */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={BriefcaseBusiness}
              title="Basic Job Details"
              description="Start with the role, company and job location."
              number="01"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Job Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                error={errors.title}
                icon={BriefcaseBusiness}
                placeholder="e.g. Java Backend Developer"
                maxLength={150}
                required
              />

              <Field
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                error={errors.companyName}
                icon={Building2}
                placeholder="Enter company name"
                maxLength={150}
                required
              />

              <div className="md:col-span-2">
                <Field
                  label="Job Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  error={errors.location}
                  icon={MapPin}
                  placeholder="e.g. Bengaluru, Karnataka"
                  maxLength={150}
                  required
                />
              </div>

              <SelectField
                label="Employment Type"
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                options={EMPLOYMENT_TYPES}
                error={errors.employmentType}
                icon={Clock3}
                placeholder="Select employment type"
              />

              <SelectField
                label="Work Mode"
                name="workMode"
                value={form.workMode}
                onChange={handleChange}
                options={WORK_MODES}
                error={errors.workMode}
                icon={Laptop}
                placeholder="Select work mode"
              />
            </div>
          </section>

          {/* Description */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={FileText}
              title="Role Description"
              description="Explain the responsibilities and skills needed for this role."
              number="02"
            />

            <div className="space-y-6">
              <TextEditor
                label="Job Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                error={errors.description}
                textareaRef={descriptionRef}
                placeholder="Describe the role, responsibilities, team and what the candidate will work on..."
                required
                rows={7}
              />

              <TextEditor
                label="Requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                textareaRef={requirementsRef}
                placeholder="List the required skills, qualifications and experience..."
                rows={6}
              />
            </div>
          </section>

          {/* Salary */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={IndianRupee}
              title="Salary & Compensation"
              description="Add an optional salary range in Indian Rupees (₹)."
              number="03"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Minimum Salary (₹)"
                name="salaryMin"
                type="number"
                value={form.salaryMin}
                onChange={handleChange}
                error={errors.salaryMin}
                icon={IndianRupee}
                placeholder="e.g. 300000"
                min="0"
                step="0.01"
                hint="Optional · Maximum 10 digits and 2 decimal places"
              />

              <Field
                label="Maximum Salary (₹)"
                name="salaryMax"
                type="number"
                value={form.salaryMax}
                onChange={handleChange}
                error={errors.salaryMax}
                icon={IndianRupee}
                placeholder="e.g. 600000"
                min="0"
                step="0.01"
                hint="Optional · Must be greater than or equal to minimum"
              />
            </div>

            {(form.salaryMin !== "" || form.salaryMax !== "") && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold text-blue-700">
                  Salary Preview
                </p>

                <p className="mt-1 break-words text-lg font-extrabold text-slate-900">
                  {form.salaryMin !== "" &&
                    form.salaryMax !== ""
                    ? `${formatINR(form.salaryMin)} – ${formatINR(form.salaryMax)}`
                    : form.salaryMin !== ""
                      ? `From ${formatINR(form.salaryMin)}`
                      : `Up to ${formatINR(form.salaryMax)}`}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-500">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-blue-500"
              />
              Salary fields are optional. Enter amounts in INR
              using the same salary period your job listing
              communicates (for example, annual CTC).
            </div>
          </section>

          {/* Deadline */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={CalendarDays}
              title="Application Deadline"
              description="Choose the last date candidates can apply."
              number="04"
            />

            <Field
              label="Last Date to Apply"
              name="applicationDeadline"
              type="date"
              value={form.applicationDeadline}
              onChange={handleChange}
              error={errors.applicationDeadline}
              icon={CalendarDays}
              min={today}
              required
              hint="Today or any future date is allowed."
            />

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs leading-6 text-emerald-800">
                Your new job will be created with{" "}
                <strong>OPEN</strong> status. You can close it
                later from the Manage Jobs page.
              </p>
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Ready to publish?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Review your details before posting the job.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={!hasFormChanges || saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                >
                  <RotateCcw size={17} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 sm:flex-none"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Publish Job
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowResetConfirm(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-job-title"
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <RotateCcw size={27} />
            </div>

            <h2
              id="reset-job-title"
              className="mt-5 text-xl font-extrabold text-slate-900"
            >
              Reset all fields?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              This will clear everything you've entered in
              the job form. This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
              >
                <RotateCcw size={17} />
                Reset Form
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CreateJobPage;
