import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { AuthContext } from "../../auth/AuthContext";

const scoreTone = (score) => {
  if (score >= 85) return { ring: "#2f5d50", label: "Strong match" };
  if (score >= 70) return { ring: "#b8852a", label: "Good match" };
  return { ring: "#c4623f", label: "Stretch role" };
};

const clampScore = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const ScoreDial = ({ score }) => {
  const tone = scoreTone(score);
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <div
        className="h-20 w-20 rounded-full"
        style={{
          background: `conic-gradient(${tone.ring} ${score * 3.6}deg, #e7e1d4 0deg)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-xl font-semibold leading-none text-[#1c1a17]">{score}</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[#8a8275]">match</span>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // composer state
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [aboutYou, setAboutYou] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [composerError, setComposerError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      setResumeName("");
      setResumeError("");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeFile(null);
      setResumeName("");
      setResumeError("Upload a PDF resume.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      setResumeName("");
      setResumeError("Resume must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setResumeName(file.name);
    setResumeError("");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setComposerError("Job description is required.");
      return;
    }

    if (resumeError) {
      return;
    }

    setComposerError("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("jobTitle", jobTitle);
      formData.append("company", company);
      formData.append("selfDescription", aboutYou);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await axiosInstance.post("/api/interview/", formData);
      navigate(`/report/${response.data.interviewReport._id}`);
    } catch (err) {
      setComposerError(err.response?.data?.message || "Failed to generate interview report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    async function getData() {
      try {
        const { data } = await axiosInstance.get("/api/interview/");
        setData(data.interviewReports);
      } catch (err) {
        setError(err.response?.data?.message || "Fetching failed");
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e7e1d4] border-t-[#2f5d50] rounded-full animate-spin" />
          <p className="text-sm text-[#8a8275]">Loading your reports…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e7e1d4] rounded-xl shadow-sm px-8 py-10 max-w-sm w-full text-center">
          <div className="w-10 h-10 bg-[#f7ece7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-[#c4623f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-[#1c1a17] font-medium">{error}</p>
          <p className="text-xs text-[#8a8275] mt-1">Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const reports = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1c1a17]">
      {/* Top bar */}
      <header className="border-b border-[#e7e1d4] bg-[#f7f3eb]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f5d50]">
              <svg className="h-4 w-4 text-[#f7f3eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
            </div>
            <span className="font-serif text-lg font-semibold">InterviewPrep AI</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[#e7e1d4] bg-white px-3 py-1.5 text-sm font-medium text-[#1c1a17] transition hover:border-[#2f5d50]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Composer */}
        <section className="mb-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <div>
            <h1 className="text-balance font-serif text-3xl leading-tight sm:text-4xl">
              Prep for your next interview
            </h1>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-[#5c564b]">
              Paste the job description and tell us a little about yourself. We&apos;ll analyze the match, surface likely questions, and build you a focused plan.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="rounded-2xl border border-[#e7e1d4] bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="grid gap-5 sm:grid-cols-2 xl:col-span-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="jobTitle" className="text-sm font-medium text-[#1c1a17]">
                    Job title
                  </label>
                  <input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Frontend Engineer"
                    className="h-12 rounded-xl border border-[#e7e1d4] bg-[#fbf9f4] px-3.5 text-sm text-[#1c1a17] outline-none transition placeholder:text-[#a39c8d] focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="company" className="text-sm font-medium text-[#1c1a17]">
                    Company
                  </label>
                  <input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme"
                    className="h-12 rounded-xl border border-[#e7e1d4] bg-[#fbf9f4] px-3.5 text-sm text-[#1c1a17] outline-none transition placeholder:text-[#a39c8d] focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="jobDescription" className="flex items-center gap-1 text-sm font-medium text-[#1c1a17]">
                  Job description
                  <span className="text-[#c4623f]" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the full job posting here…"
                  className="mt-2 w-full resize-none rounded-xl border border-[#e7e1d4] bg-[#fbf9f4] px-3.5 py-3 text-sm leading-relaxed text-[#1c1a17] outline-none transition placeholder:text-[#a39c8d] focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
                />
              </div>
              <div>
                <label htmlFor="aboutYou" className="text-sm font-medium text-[#1c1a17]">
                  About you <span className="text-[#a39c8d]">(optional)</span>
                </label>
                <textarea
                  id="aboutYou"
                  value={aboutYou}
                  onChange={(e) => setAboutYou(e.target.value)}
                  rows={6}
                  placeholder="Your experience, strengths, or anything you want us to weigh…"
                  className="mt-2 w-full resize-none rounded-xl border border-[#e7e1d4] bg-[#fbf9f4] px-3.5 py-3 text-sm leading-relaxed text-[#1c1a17] outline-none transition placeholder:text-[#a39c8d] focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-4 border-t border-[#e7e1d4] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="dashboardResume"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#d8d1c2] bg-[#fbf9f4] px-4 py-3 text-sm text-[#5c564b] transition hover:border-[#2f5d50] focus-within:border-[#2f5d50] focus-within:ring-2 focus-within:ring-[#2f5d50]/20"
              >
                <svg className="h-5 w-5 text-[#8a8275]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="min-w-0 truncate">{resumeName || "Upload resume (PDF up to 5 MB)"}</span>
                <input
                  id="dashboardResume"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleResumeChange}
                />
              </label>
              {resumeError && (
                <p role="alert" className="text-sm text-[#c4623f] sm:hidden">
                  {resumeError}
                </p>
              )}

              <button
                type="submit"
                disabled={!jobDescription.trim() || isAnalyzing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f5d50] px-6 py-3 text-sm font-semibold text-[#f7f3eb] transition hover:bg-[#264b41] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f7f3eb]/30 border-t-[#f7f3eb]" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            {resumeError && (
              <p role="alert" className="mt-2 hidden text-sm text-[#c4623f] sm:block">
                {resumeError}
              </p>
            )}
            {composerError && (
              <p role="alert" className="mt-3 rounded-lg bg-[#c4623f]/10 px-3 py-2 text-sm text-[#c4623f]">
                {composerError}
              </p>
            )}
          </form>
        </section>

        {/* Reports */}
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Your reports</h2>
            <span className="text-sm text-[#8a8275]">{reports.length} total</span>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8d1c2] bg-white/60 px-6 py-16 text-center">
              <p className="font-serif text-lg text-[#1c1a17]">No reports yet</p>
              <p className="mt-1 text-sm text-[#8a8275]">
                Run your first analysis above to see it here.
              </p>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reports.map((report) => {
                const score = clampScore(report.matchScore);
                const tone = scoreTone(score);
                return (
                  <li key={report._id}>
                    <Link
                      to={`/report/${report._id}`}
                      className="group flex h-full w-full flex-col rounded-2xl border border-[#e7e1d4] bg-white p-6 text-left transition hover:border-[#2f5d50] hover:shadow-sm"
                    >
                      <div className="flex items-start gap-5">
                        <ScoreDial score={score} />
                        <div className="min-w-0 flex-1">
                          <span
                            className="inline-flex items-center rounded-full bg-[#f1ede3] px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: tone.ring }}
                          >
                            {tone.label}
                          </span>
                          <h3 className="mt-2 text-balance font-serif text-lg leading-snug text-[#1c1a17]">
                            {report.title || "Untitled report"}
                          </h3>
                          <p className="mt-1 text-xs text-[#8a8275]">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d4]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: tone.ring }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[#e7e1d4] pt-4">
                        <span className="text-sm font-medium text-[#2f5d50]">View report</span>
                        <svg
                          className="shrink-0 text-[#8a8275] transition group-hover:translate-x-0.5 group-hover:text-[#2f5d50]"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
