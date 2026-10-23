

import { useCallback, useEffect, useRef, useState } from "react";

import {

  Link,

  useBeforeUnload,

  useNavigate,

  useParams,

} from "react-router-dom";

import {

  AlertCircle,

  ArrowLeft,

  ArrowRight,

  BriefcaseBusiness,

  Building2,

  CalendarDays,

  CheckCircle2,

  ChevronDown,

  Clock3,

  FileText,

  IndianRupee,

  Info,

  Laptop,

  List,

  LoaderCircle,

  MapPin,

  RefreshCw,

  RotateCcw,

  Save,

  ShieldCheck,

  Sparkles,

  X,

} from "lucide-react";



import DashboardLayout from "../components/layout/DashboardLayout";

import { apiRequest } from "../services/api";



const EMPTY_FORM = {

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



  const number = Number(value);



  return Number.isFinite(number)

    ? INR_FORMATTER.format(number)

    : "";

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



function normalizeJob(job) {

  return {

    title: job.title ?? "",

    companyName: job.companyName ?? "",

    description: job.description ?? "",

    requirements: job.requirements ?? "",

    location: job.location ?? "",

    employmentType: job.employmentType ?? "",

    workMode: job.workMode ?? "",

    salaryMin:

      job.salaryMin === null || job.salaryMin === undefined

        ? ""

        : String(job.salaryMin),

    salaryMax:

      job.salaryMax === null || job.salaryMax === undefined

        ? ""

        : String(job.salaryMax),

    applicationDeadline: job.applicationDeadline ?? "",

  };

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

    errors.companyName = "Company name cannot exceed 150 characters.";

  }



  if (!form.description.trim()) {

    errors.description = "Job description is required.";

  }



  if (!form.location.trim()) {

    errors.location = "Job location is required.";

  } else if (form.location.trim().length > 150) {

    errors.location = "Location cannot exceed 150 characters.";

  }



  if (

    !EMPLOYMENT_TYPES.some(

      (option) => option.value === form.employmentType

    )

  ) {

    errors.employmentType = "Select an employment type.";

  }



  if (

    !WORK_MODES.some(

      (option) => option.value === form.workMode

    )

  ) {

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

        <div className="flex flex-wrap items-center gap-2">

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



function InputField({

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

  const id = `edit-job-${name}`;



  return (

    <div className="space-y-2">

      <label

        htmlFor={id}

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

          id={id}

          name={name}

          type={type}

          value={value}

          onChange={onChange}

          placeholder={placeholder}

          required={required}

          maxLength={maxLength}

          min={min}

          step={step}

          aria-invalid={Boolean(error)}

          aria-describedby={error ? `${id}-error` : undefined}

          className={`w-full rounded-xl border bg-slate-50 py-3.5 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${Icon ? "pl-11" : "pl-4"

            } ${error

              ? "border-red-300 focus:border-red-500 focus:ring-red-100"

              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"

            }`}

        />

      </div>



      {error ? (

        <p

          id={`${id}-error`}

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

  const id = `edit-job-${name}`;



  return (

    <div className="space-y-2">

      <label

        htmlFor={id}

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

          id={id}

          name={name}

          value={value}

          onChange={onChange}

          required

          aria-invalid={Boolean(error)}

          aria-describedby={error ? `${id}-error` : undefined}

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

          id={`${id}-error`}

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

  textareaRef,

  placeholder,

  required = false,

  rows = 6,

}) {

  const id = `edit-job-${name}`;



  function updateValue(nextValue) {

    onChange({

      target: {

        name,

        value: nextValue,

      },

    });

  }



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



    updateValue(before + prefix + after);



    const position = start + prefix.length;



    requestAnimationFrame(() => {

      textarea.focus();

      textarea.setSelectionRange(position, position);

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

      updateValue(value.slice(0, lineStart) + after);



      requestAnimationFrame(() => {

        textarea.focus();

        textarea.setSelectionRange(lineStart, lineStart);

      });



      return;

    }



    updateValue(before + "\n• " + after);



    const position = cursor + 3;



    requestAnimationFrame(() => {

      textarea.focus();

      textarea.setSelectionRange(position, position);

    });

  }



  return (

    <div className="space-y-2">

      <div className="flex flex-wrap items-center justify-between gap-2">

        <label

          htmlFor={id}

          className="flex items-center gap-1.5 text-sm font-bold text-slate-700"

        >

          {label}

          {required && <span className="text-red-500">*</span>}

        </label>



        <button

          type="button"

          onClick={insertBullet}

          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"

        >

          <List size={14} />

          Add Bullet

        </button>

      </div>



      <textarea

        ref={textareaRef}

        id={id}

        name={name}

        value={value}

        onChange={onChange}

        onKeyDown={handleKeyDown}

        placeholder={placeholder}

        required={required}

        rows={rows}

        aria-invalid={Boolean(error)}

        aria-describedby={error ? `${id}-error` : undefined}

        className={`w-full resize-y rounded-xl border bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${error

            ? "border-red-300 focus:border-red-500 focus:ring-red-100"

            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"

          }`}

      />



      {error ? (

        <p

          id={`${id}-error`}

          className="flex items-center gap-1.5 text-xs font-medium text-red-600"

        >

          <AlertCircle size={13} />

          {error}

        </p>

      ) : (

        <p className="text-xs text-slate-400">

          Use bullet points to organize details.

          Press Enter to continue a bullet list.

        </p>

      )}

    </div>

  );

}



function EditJobPage() {

  const { jobId } = useParams();

  const navigate = useNavigate();



  const [job, setJob] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [originalForm, setOriginalForm] = useState(EMPTY_FORM);



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [saveError, setSaveError] = useState("");

  const [errors, setErrors] = useState({});

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);



  const descriptionRef = useRef(null);

  const requirementsRef = useRef(null);

  const formTopRef = useRef(null);



  const hasChanges = Object.keys(EMPTY_FORM).some(

    (key) => form[key] !== originalForm[key]

  );



  const loadJob = useCallback(async () => {

    setLoading(true);

    setError("");



    try {

      const recruiterJobs = await apiRequest("/api/recruiter/jobs");

      const data = recruiterJobs.find(
        (item) => String(item.id) === String(jobId)
      );



      if (!data || data.id === undefined) {

        throw new Error("Job details were not found.");

      }



      const normalized = normalizeJob(data);



      setJob(data);

      setForm(normalized);

      setOriginalForm(normalized);

      setErrors({});

    } catch (err) {

      setError(err.message || "Unable to load job details.");

    } finally {

      setLoading(false);

    }

  }, [jobId]);



  useEffect(() => {

    loadJob();

  }, [loadJob]);



  useBeforeUnload(

    useCallback(

      (event) => {

        if (!hasChanges || saving) return;



        event.preventDefault();

        event.returnValue = "";

      },

      [hasChanges, saving]

    )

  );



  function handleChange(event) {

    const { name, value } = event.target;



    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));



    setErrors((previous) => {

      const next = { ...previous };

      delete next[name];



      if (name === "salaryMin" || name === "salaryMax") {

        delete next.salaryMax;

      }



      return next;

    });



    if (saveError) setSaveError("");

  }



  function resetChanges() {

    setForm({ ...originalForm });

    setErrors({});

    setSaveError("");

    setShowDiscardConfirm(false);

    formTopRef.current?.scrollIntoView({

      behavior: "smooth",

      block: "start",

    });

  }



  async function handleSubmit(event) {

    event.preventDefault();



    if (saving || loading || !job || job.status !== "OPEN") return;



    const validationErrors = validateForm(form);

    setErrors(validationErrors);

    setSaveError("");



    if (Object.keys(validationErrors).length > 0) {

      requestAnimationFrame(() => {

        document

          .querySelector('[aria-invalid="true"]')

          ?.focus();

      });

      return;

    }



    if (!hasChanges) {

      navigate("/recruiter/jobs");

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

      await apiRequest(`/api/recruiter/jobs/${jobId}`, {

        method: "PUT",

        body: JSON.stringify(payload),

      });



      setOriginalForm({ ...form });



      navigate("/recruiter/jobs", {

        replace: true,

        state: {

          successMessage: `Job "${payload.title}" updated successfully.`,

        },

      });

    } catch (err) {

      setSaveError(

        err.message || "Unable to update the job. Please try again."

      );



      formTopRef.current?.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

    } finally {

      setSaving(false);

    }

  }



  function handleBack() {

    if (hasChanges && !saving) {

      setShowDiscardConfirm(true);

      return;

    }



    navigate("/recruiter/jobs");

  }



  const isClosed = job?.status === "CLOSED";

  const today = getTodayLocal();



  return (

    <DashboardLayout

      title="Edit Job"

      description="Update your job listing and keep candidates informed."

    >

      <div ref={formTopRef} className="space-y-6">

        {/* Hero */}

        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">

          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />



          <div className="relative flex flex-wrap items-start justify-between gap-5">

            <div className="max-w-xl">

              <button

                type="button"

                onClick={handleBack}

                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 transition hover:text-white"

              >

                <ArrowLeft size={15} />

                Back to Jobs

              </button>



              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">

                <Sparkles size={14} />

                Recruitment Workspace

              </div>



              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">

                Fine-tune your opportunity.

              </h2>



              <p className="mt-3 text-sm leading-7 text-slate-300">

                Keep your job details accurate and up to date

                so candidates know exactly what to expect.

              </p>

            </div>



            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-200 sm:h-20 sm:w-20">

              <BriefcaseBusiness size={32} />

            </div>

          </div>

        </section>



        {/* Loading */}

        {loading ? (

          <div className="flex min-h-80 flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-8">

            <LoaderCircle

              size={34}

              className="animate-spin text-blue-600"

            />



            <p className="mt-4 text-sm font-medium text-slate-500">

              Loading job details...

            </p>

          </div>

        ) : error ? (

          <div

            role="alert"

            className="rounded-[22px] border border-red-200 bg-white p-8 text-center"

          >

            <AlertCircle

              size={36}

              className="mx-auto text-red-500"

            />



            <h3 className="mt-4 text-lg font-bold text-slate-900">

              Unable to load job

            </h3>



            <p className="mt-2 text-sm text-red-600">

              {error}

            </p>



            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <button

                type="button"

                onClick={loadJob}

                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"

              >

                <RefreshCw size={17} />

                Retry

              </button>



              <Link

                to="/recruiter/jobs"

                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"

              >

                <ArrowLeft size={17} />

                Manage Jobs

              </Link>

            </div>

          </div>

        ) : isClosed ? (
          <div
            role="alert"
            className="rounded-[24px] border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle size={32} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-900 sm:text-2xl">
              This job is closed
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
              <strong>{job?.title}</strong> is closed and cannot be edited.
              You can still view its details and existing applicants from Manage Jobs.
            </p>
            <Link
              to="/recruiter/jobs"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to Manage Jobs
            </Link>
          </div>
        ) : (
          <>
            {/* Job overview */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <BriefcaseBusiness size={21} />

                  </div>



                  <div className="min-w-0">

                    <h3 className="break-words text-sm font-bold text-slate-900">

                      {job.title}

                    </h3>



                    <p className="mt-1 text-xs text-slate-500">

                      Job #{job.id} · Posted {formatDate(job.createdAt)}

                    </p>

                  </div>

                </div>



                <span

                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${isClosed

                      ? "border-slate-200 bg-slate-100 text-slate-600"

                      : "border-emerald-200 bg-emerald-50 text-emerald-700"

                    }`}

                >

                  {isClosed ? (

                    <Clock3 size={14} />

                  ) : (

                    <CheckCircle2 size={14} />

                  )}

                  {job.status}

                </span>

              </div>



              {isClosed && (

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">

                  <Info size={16} className="mt-0.5 shrink-0" />

                  This job is CLOSED. Whether a closed job can

                  be edited depends on the backend's business rules.

                </div>

              )}



              {hasChanges && (

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">

                  <AlertCircle size={16} />

                  You have unsaved changes.

                </div>

              )}

            </section>



            {saveError && (

              <div

                role="alert"

                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"

              >

                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <span>{saveError}</span>

              </div>

            )}



            <form

              onSubmit={handleSubmit}

              noValidate

              className="space-y-6"

            >

              {/* Basic information */}

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <SectionHeading

                  icon={BriefcaseBusiness}

                  title="Basic Job Details"

                  description="Update the role, company and work arrangement."

                  number="01"

                />



                <div className="grid gap-5 md:grid-cols-2">

                  <InputField

                    label="Job Title"

                    name="title"

                    value={form.title}

                    onChange={handleChange}

                    error={errors.title}

                    icon={BriefcaseBusiness}

                    placeholder="Enter job title"

                    maxLength={150}

                    required

                  />



                  <InputField

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

                    <InputField

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

                  description="Refine responsibilities, expectations and requirements."

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

                    placeholder="Describe the role and responsibilities..."

                    required

                    rows={7}

                  />



                  <TextEditor

                    label="Requirements"

                    name="requirements"

                    value={form.requirements}

                    onChange={handleChange}

                    textareaRef={requirementsRef}

                    placeholder="List required skills and qualifications..."

                    rows={6}

                  />

                </div>

              </section>



              {/* Salary */}

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <SectionHeading

                  icon={IndianRupee}

                  title="Salary & Compensation"

                  description="Update the salary range in Indian Rupees (₹)."

                  number="03"

                />



                <div className="grid gap-5 md:grid-cols-2">

                  <InputField

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

                    hint="Optional · Up to 10 digits and 2 decimal places"

                  />



                  <InputField

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

                    hint="Optional · Must not be below minimum salary"

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

              </section>



              {/* Deadline */}

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <SectionHeading

                  icon={CalendarDays}

                  title="Application Deadline"

                  description="Choose the last date candidates can apply."

                  number="04"

                />



                <InputField

                  label="Last Date to Apply"

                  name="applicationDeadline"

                  type="date"

                  value={form.applicationDeadline}

                  onChange={handleChange}

                  error={errors.applicationDeadline}

                  icon={CalendarDays}

                  min={today}

                  required

                  hint="The backend requires today's date or a future date."

                />



                <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">

                  <ShieldCheck

                    size={19}

                    className="mt-0.5 shrink-0 text-blue-600"

                  />



                  <p className="text-xs leading-6 text-slate-600">

                    Changes will be saved to your existing job

                    listing. The job's status is managed separately

                    through the Close Job action.

                  </p>

                </div>

              </section>



              {/* Actions */}

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>

                    <p className="text-sm font-bold text-slate-900">

                      Review your changes

                    </p>



                    <p className="mt-1 text-xs leading-6 text-slate-500">

                      {hasChanges

                        ? "You have changes ready to save."

                        : "No changes have been made yet."}

                    </p>

                  </div>



                  <div className="flex w-full flex-wrap gap-3 sm:w-auto">

                    <button

                      type="button"

                      onClick={() => setShowDiscardConfirm(true)}

                      disabled={!hasChanges || saving}

                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"

                    >

                      <RotateCcw size={17} />

                      Reset

                    </button>



                    <button

                      type="submit"

                      disabled={!hasChanges || saving}

                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:flex-none"

                    >

                      {saving ? (

                        <>

                          <LoaderCircle

                            size={18}

                            className="animate-spin"

                          />

                          Saving...

                        </>

                      ) : (

                        <>

                          <Save size={18} />

                          Save Changes

                          <ArrowRight size={16} />

                        </>

                      )}

                    </button>

                  </div>

                </div>

              </section>

            </form>

          </>

        )}

      </div>



      {/* Discard confirmation */}

      {showDiscardConfirm && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setShowDiscardConfirm(false);

            }

          }}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="discard-title"

            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl sm:p-7"

          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">

              <AlertCircle size={27} />

            </div>



            <h2

              id="discard-title"

              className="mt-5 text-xl font-extrabold text-slate-900"

            >

              Discard unsaved changes?

            </h2>



            <p className="mt-3 text-sm leading-7 text-slate-600">

              Your edits have not been saved yet. You can

              reset the form or return to job management.

            </p>



            <div className="mt-6 flex flex-wrap justify-end gap-3">

              <button

                type="button"

                onClick={() => setShowDiscardConfirm(false)}

                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"

              >

                Keep Editing

              </button>



              <button

                type="button"

                onClick={resetChanges}

                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700"

              >

                <RotateCcw size={16} />

                Reset Changes

              </button>



              <button

                type="button"

                onClick={() => navigate("/recruiter/jobs")}

                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"

              >

                Leave Page

              </button>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>

  );

}



export default EditJobPage;
