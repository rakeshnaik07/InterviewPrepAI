import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const NewReportPage = () => {
  const navigate = useNavigate();
  const maxResumeSize = 5 * 1024 * 1024;

  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      setFileError("");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeFile(null);
      setFileError("Upload a PDF resume.");
      e.target.value = "";
      return;
    }

    if (file.size > maxResumeSize) {
      setResumeFile(null);
      setFileError("Resume must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setError("Job description is required.");
      return;
    }

    if (fileError) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("jobDescription", jobDescription);
      formData.append("jobTitle", jobTitle);
      formData.append("company", company);
      formData.append("selfDescription", selfDescription);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await axiosInstance.post(
        "/api/interview/",
        formData
      );

      navigate(`/report/${response.data.interviewReport._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate interview report."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-[#2f5d50] text-[#f7f3eb] flex flex-col font-sans">
        <header className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-[#f7f3eb]/10">
          <span className="text-sm font-medium text-[#f7f3eb]/70">InterviewPrep AI</span>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-6 h-5 w-5 animate-spin rounded-full border-[3px] border-[#f7f3eb]/20 border-t-[#e3b98f]" />

          <h1
            className="text-2xl tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Building your report
          </h1>
          <p className="mt-1 text-sm text-[#f7f3eb]/60">
            {jobDescription.slice(0, 60) || "Your job description"}
            {jobDescription.length > 60 ? "…" : ""}
          </p>

          {/* Decorative step list — static, not driven by real progress */}
          <div className="mt-8 flex w-72 flex-col gap-2.5 text-left text-sm">
            <div className="flex items-center gap-2.5 text-[#9fe1cb]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              <span>Read the job description</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#9fe1cb]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              <span>Compared it to your background</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#f7f3eb]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e3b98f]" />
              <span>Writing your interview questions</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#f7f3eb]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span>Identifying skill gaps</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#f7f3eb]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span>Building your 7-day plan</span>
            </div>
          </div>

          <p className="mt-8 text-sm text-[#f7f3eb]/60">Usually takes under a minute.</p>

          <div className="mt-6 flex max-w-sm items-start gap-2.5 rounded-lg border border-[#f7f3eb]/15 bg-[#1a4845] px-4 py-3 text-left">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#e3b98f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 9v4M12 17h.01" />
              <path d="m10.29 3.86-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
            <p className="text-xs leading-relaxed text-[#f7f3eb]/80">
              Stay on this page. Refreshing or navigating away will cancel the
              request and you&apos;ll need to start over.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#f7f3eb] text-[#1c1a17] font-sans">
      <header className="border-b border-[#e7e1d4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Back to dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5c564b] transition hover:bg-[#f7f3eb] hover:text-[#2f5d50]"
        >
          <svg className="h-4 w-4 text-[#5c564b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <span className="text-sm font-medium text-[#2f5d50]">InterviewPrep AI</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[320px_minmax(0,720px)] lg:px-8">
        <div>
          <h1
            className="text-3xl tracking-tight sm:text-4xl"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            New report
          </h1>
          <p className="mt-3 max-w-sm text-[#1c1a17]/60 leading-relaxed">
            Paste the job posting and we&apos;ll build your prep report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#e7e1d4] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="jobTitle" className="text-sm font-medium">
                Job title
              </label>
              <input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Frontend Engineer"
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-sm text-[#1c1a17] outline-none transition placeholder:text-[#1c1a17]/40 focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme"
                className="h-12 rounded-xl border border-[#1c1a17]/15 bg-white px-4 text-sm text-[#1c1a17] outline-none transition placeholder:text-[#1c1a17]/40 focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobDescription" className="text-sm font-medium">
              Job description <span className="text-[#c4623f]">*</span>
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
              placeholder="Paste the full job posting here..."
              className="resize-none rounded-xl border border-[#1c1a17]/15 bg-white px-4 py-3 text-sm leading-relaxed text-[#1c1a17] outline-none transition placeholder:text-[#1c1a17]/40 focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="selfDescription" className="text-sm font-medium">
              A bit about you
            </label>
            <textarea
              id="selfDescription"
              value={selfDescription}
              onChange={(e) => setSelfDescription(e.target.value)}
              rows={4}
              placeholder="Years of experience, focus areas, anything that adds context..."
              className="resize-none rounded-xl border border-[#1c1a17]/15 bg-white px-4 py-3 text-sm leading-relaxed text-[#1c1a17] outline-none transition placeholder:text-[#1c1a17]/40 focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="resume" className="text-sm font-medium">
              Resume <span className="text-[#1c1a17]/40">(optional, PDF up to 5 MB)</span>
            </label>
            <label
              htmlFor="resume"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#d8d1c2] bg-white px-4 py-4 text-sm text-[#5c564b] transition hover:border-[#2f5d50] focus-within:border-[#2f5d50] focus-within:ring-2 focus-within:ring-[#2f5d50]/20"
            >
              <svg className="h-5 w-5 text-[#8a8275]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="min-w-0 truncate">{resumeFile?.name || "Drop a PDF here or click to browse"}</span>
              <input
                id="resume"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={handleResumeChange}
              />
            </label>
            {fileError && (
              <p role="alert" className="text-sm text-[#c4623f]">
                {fileError}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-[#c4623f]/10 px-3 py-2 text-sm text-[#c4623f]">
              {error}
            </p>
          )}

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[#8a8275]">Takes about a minute to generate.</span>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-xl bg-[#2f5d50] px-6 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#264c41] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Generating..." : "Generate report"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default NewReportPage;
