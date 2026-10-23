
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Link2,
  LoaderCircle,
  RefreshCw,
  Save,
  UserRound,
  BriefcaseBusiness,
  Code2,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { apiRequest } from "../services/api";

const INITIAL_FORM = {
  phone: "",
  gender: "",
  city: "",
  state: "",
  qualification: "",
  specialization: "",
  collegeName: "",
  graduationYear: "",
  cgpa: "",
  experienceLevel: "",
  yearsOfExperience: "",
  currentJobTitle: "",
  preferredJobLocation: "",
  noticePeriod: "",
  technicalSkills: "",
  resumeUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

const FIELD_LIMITS = {
  phone: 20,
  gender: 30,
  city: 100,
  state: 100,
  qualification: 150,
  specialization: 150,
  collegeName: 200,
  currentJobTitle: 150,
  preferredJobLocation: 150,
  noticePeriod: 50,
  resumeUrl: 500,
  linkedinUrl: 500,
  githubUrl: 500,
  portfolioUrl: 500,
};

const URL_FIELDS = [
  "resumeUrl",
  "linkedinUrl",
  "githubUrl",
  "portfolioUrl",
];

function normalizeProfile(data) {
  const normalized = {};

  Object.keys(INITIAL_FORM).forEach((key) => {
    normalized[key] =
      data?.[key] === null || data?.[key] === undefined
        ? ""
        : String(data[key]);
  });

  return normalized;
}

function buildPayload(form) {
  const payload = {};

  Object.keys(INITIAL_FORM).forEach((key) => {
    const value = form[key].trim();

    if (
      key === "graduationYear" ||
      key === "cgpa" ||
      key === "yearsOfExperience"
    ) {
      payload[key] = value === "" ? null : Number(value);
    } else {
      payload[key] = value === "" ? null : value;
    }
  });

  return payload;
}

function validateForm(form) {
  const errors = {};

  Object.entries(FIELD_LIMITS).forEach(([field, max]) => {
    if (form[field].trim().length > max) {
      errors[field] = `Maximum ${max} characters allowed.`;
    }
  });

  if (form.graduationYear.trim()) {
    const year = Number(form.graduationYear);

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 2100
    ) {
      errors.graduationYear =
        "Graduation year must be between 1900 and 2100.";
    }
  }

  if (form.cgpa.trim()) {
    const value = Number(form.cgpa);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 10 ||
      !/^\d{1,2}(\.\d{1,2})?$/.test(form.cgpa.trim())
    ) {
      errors.cgpa =
        "Enter CGPA between 0 and 10 with up to 2 decimal places.";
    }
  }

  if (form.yearsOfExperience.trim()) {
    const value = Number(form.yearsOfExperience);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 999.9 ||
      !/^\d{1,3}(\.\d)?$/.test(
        form.yearsOfExperience.trim()
      )
    ) {
      errors.yearsOfExperience =
        "Enter a valid experience value with up to 1 decimal place.";
    }
  }

  if (
    form.experienceLevel &&
    !["FRESHER", "EXPERIENCED"].includes(
      form.experienceLevel
    )
  ) {
    errors.experienceLevel =
      "Please select a valid experience level.";
  }

  URL_FIELDS.forEach((field) => {
    const value = form[field].trim();

    if (!value) return;

    try {
      const parsed = new URL(value);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        errors[field] = "Use an HTTP or HTTPS URL.";
      }
    } catch {
      errors[field] =
        "Enter a complete URL starting with https://";
    }
  });

  return errors;
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  maxLength,
  step,
  min,
  max,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        step={step}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function CandidateProfilePage() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [profileExists, setProfileExists] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const data = await apiRequest("/api/candidate/profile");

      if (data) {
        setForm(normalizeProfile(data));
        setProfileExists(true);
      } else {
        setForm({ ...INITIAL_FORM });
        setProfileExists(false);
      }
    } catch (err) {
      const message = err.message || "";

      if (
        message.includes("404") ||
        /profile not found|profile does not exist/i.test(
          message
        )
      ) {
        setForm({ ...INITIAL_FORM });
        setProfileExists(false);
      } else {
        setError(
          message || "Unable to load your profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || loading || error) return;

    setError("");
    setSuccess("");

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const wasExisting = profileExists;

      await apiRequest("/api/candidate/profile", {
        method: wasExisting ? "PUT" : "POST",
        body: JSON.stringify(buildPayload(form)),
      });

      setProfileExists(true);

      try {
        const savedProfile = await apiRequest(
          "/api/candidate/profile"
        );

        if (savedProfile) {
          setForm(normalizeProfile(savedProfile));
        }
      } catch {
        // Save succeeded; keep current form values.
      }

      setError("");
      setSuccess(
        wasExisting
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err.message || "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      title="My Profile"
      description="Manage your personal, educational and professional information."
    >
      {loading ? (
        <div
          role="status"
          className="flex min-h-80 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-blue-600"
        >
          <LoaderCircle
            size={24}
            className="animate-spin"
          />
          <span className="text-sm font-semibold">
            Loading profile...
          </span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                profileExists
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {profileExists
                ? "Profile Created"
                : "New Profile"}
            </span>

            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={17} />
              Reload
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />
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

          <FormSection
            icon={UserRound}
            title="Personal Information"
            description="Your contact details and location."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter phone number"
                error={fieldErrors.phone}
              />

              <Field
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                maxLength={30}
                placeholder="Enter gender"
                error={fieldErrors.gender}
              />

              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Bengaluru"
                error={fieldErrors.city}
              />

              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Karnataka"
                error={fieldErrors.state}
              />
            </div>
          </FormSection>

          <FormSection
            icon={GraduationCap}
            title="Education"
            description="Your academic qualifications."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. B.Tech"
                error={fieldErrors.qualification}
              />

              <Field
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Computer Science"
                error={fieldErrors.specialization}
              />

              <div className="sm:col-span-2">
                <Field
                  label="College Name"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="Enter your college name"
                  error={fieldErrors.collegeName}
                />
              </div>

              <Field
                label="Graduation Year"
                name="graduationYear"
                type="number"
                value={form.graduationYear}
                onChange={handleChange}
                min={1900}
                max={2100}
                step={1}
                placeholder="e.g. 2026"
                error={fieldErrors.graduationYear}
              />

              <Field
                label="CGPA (out of 10)"
                name="cgpa"
                type="number"
                value={form.cgpa}
                onChange={handleChange}
                min={0}
                max={10}
                step="0.01"
                placeholder="e.g. 8.50"
                error={fieldErrors.cgpa}
              />
            </div>
          </FormSection>

          <FormSection
            icon={BriefcaseBusiness}
            title="Professional Information"
            description="Your experience and career preferences."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="experienceLevel"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Experience Level
                </label>

                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  aria-invalid={Boolean(
                    fieldErrors.experienceLevel
                  )}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select experience level
                  </option>
                  <option value="FRESHER">Fresher</option>
                  <option value="EXPERIENCED">
                    Experienced
                  </option>
                </select>

                {fieldErrors.experienceLevel && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.experienceLevel}
                  </p>
                )}
              </div>

              <Field
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min={0}
                max={999.9}
                step="0.1"
                placeholder="e.g. 1.5"
                error={fieldErrors.yearsOfExperience}
              />

              <Field
                label="Current Job Title"
                name="currentJobTitle"
                value={form.currentJobTitle}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Java Developer"
                error={fieldErrors.currentJobTitle}
              />

              <Field
                label="Preferred Job Location"
                name="preferredJobLocation"
                value={form.preferredJobLocation}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Bengaluru / Remote"
                error={fieldErrors.preferredJobLocation}
              />

              <div className="sm:col-span-2">
                <Field
                  label="Notice Period"
                  name="noticePeriod"
                  value={form.noticePeriod}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. Immediate / 30 days"
                  error={fieldErrors.noticePeriod}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Code2}
            title="Technical Skills"
            description="Technologies and tools you know."
          >
            <label
              htmlFor="technicalSkills"
              className="block text-sm font-semibold text-slate-700"
            >
              Your Skills
            </label>

            <textarea
              id="technicalSkills"
              name="technicalSkills"
              value={form.technicalSkills}
              onChange={handleChange}
              rows={5}
              placeholder="Java, Spring Boot, MySQL, React, JavaScript, Git..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate skills with commas for readability.
            </p>
          </FormSection>

          <FormSection
            icon={Link2}
            title="Resume & Professional Links"
            description="Share your resume and online work."
          >
            <div className="space-y-5">
              {[
                {
                  name: "resumeUrl",
                  label: "Resume URL",
                  placeholder:
                    "https://example.com/resume.pdf",
                },
                {
                  name: "linkedinUrl",
                  label: "LinkedIn URL",
                  placeholder:
                    "https://www.linkedin.com/in/...",
                },
                {
                  name: "githubUrl",
                  label: "GitHub URL",
                  placeholder:
                    "https://github.com/...",
                },
                {
                  name: "portfolioUrl",
                  label: "Portfolio URL",
                  placeholder:
                    "https://yourportfolio.com",
                },
              ].map((item) => (
                <div key={item.name}>
                  <Field
                    label={item.label}
                    name={item.name}
                    type="url"
                    value={form[item.name]}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder={item.placeholder}
                    error={fieldErrors[item.name]}
                  />

                  {form[item.name] &&
                    !fieldErrors[item.name] &&
                    /^https?:\/\//i.test(
                      form[item.name].trim()
                    ) && (
                      <a
                        href={form[item.name].trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Open link
                        <ExternalLink size={13} />
                      </a>
                    )}
                </div>
              ))}
            </div>
          </FormSection>

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {profileExists
                  ? "Update your profile"
                  : "Create your profile"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your details will be saved to your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || Boolean(error)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
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
                : profileExists
                  ? "Save Changes"
                  : "Create Profile"}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}

export default CandidateProfilePage;
