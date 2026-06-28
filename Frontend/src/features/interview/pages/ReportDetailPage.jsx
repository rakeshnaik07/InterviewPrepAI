import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const severityStyles = {
  low: { dot: "#3b6d11", text: "#27500a" },
  medium: { dot: "#b6791f", text: "#633806" },
  high: { dot: "#a32d2d", text: "#791f1f" },
};

const TABS = [
  { key: "technical", label: "Technical" },
  { key: "behavioral", label: "Behavioral" },
  { key: "plan", label: "7-Day Plan" },
];

const toArray = (value) => (Array.isArray(value) ? value : []);
const clampScore = (value) => Math.min(100, Math.max(0, Number(value) || 0));
const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return value ? String(value) : "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        return "";
      }
    } catch (_) {
      return trimmed;
    }
  }

  return trimmed;
};

const QuestionAccordion = ({ questions, tabKey, openQuestions, toggleQuestion }) => (
  <div className="mt-4 flex flex-col gap-3">
    {questions.map((question, index) => {
      const itemKey = `${tabKey}-${question._id || question.question || index}`;
      const isOpen = openQuestions.has(itemKey);

      return (
        <div key={itemKey} className="rounded-xl border border-[#e7e1d4] bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => toggleQuestion(itemKey)}
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-medium leading-relaxed">{question.question}</span>
            <svg
              className={`h-4 w-4 shrink-0 text-[#8a8275] transition-transform ${isOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isOpen && (
            <div className="border-t border-[#e7e1d4] px-5 pb-5 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a8275]">
                Why they ask this
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#5c564b]">
                {question.intention}
              </p>
              <div className="mt-3 rounded-lg bg-[#fbf9f4] p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a8275]">
                  Suggested approach
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#1c1a17]">
                  {question.answer}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const ReportDetailPage = () => {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  const [activeTab, setActiveTab] = useState("technical");
  const [openQuestions, setOpenQuestions] = useState(new Set());

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axiosInstance.get(
          `/api/interview/report/${id}`
        );

        setReport(response.data.interviewReport);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load interview report."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownloadResume = async () => {
    setIsDownloadingResume(true);
    setError("");

    try {
      const response = await axiosInstance.post(
        `/api/interview/resume/pdf/${id}`,
        {},
        {
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_${id}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download resume PDF.");
    } finally {
      setIsDownloadingResume(false);
    }
  };

  const toggleQuestion = (itemKey) => {
    setOpenQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e7e1d4] border-t-[#2f5d50] rounded-full animate-spin" />
          <p className="text-sm text-[#8a8275]">Loading report…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e7e1d4] rounded-xl shadow-sm px-8 py-10 max-w-sm w-full text-center">
          <p className="text-sm font-medium text-[#1c1a17]">{error}</p>
          <p className="text-xs text-[#8a8275] mt-1">Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e7e1d4] rounded-xl shadow-sm px-8 py-10 max-w-sm w-full text-center">
          <p className="text-sm font-medium text-[#1c1a17]">Report not found.</p>
          <p className="text-xs text-[#8a8275] mt-1">Return to the dashboard and try again.</p>
        </div>
      </div>
    );
  }

  const skillGaps = toArray(report.skillGaps);
  const technicalQuestions = toArray(report.technicalQuestions);
  const behavioralQuestions = toArray(report.behavioralQuestions);
  const preparationPlan = toArray(report.preparationPlan);
  const score = clampScore(report.matchScore);
  const planLabel = preparationPlan.length > 0 ? `${preparationPlan.length}-Day Plan` : "Preparation Plan";
  const getPlanFocus = (dayPlan, dayNumber) => {
    const cleanFocus = sanitizeText(dayPlan.focus);
    if (cleanFocus) {
      return cleanFocus;
    }

    if (typeof dayPlan === "string") {
      const maybeParsed = sanitizeText(dayPlan);
      if (maybeParsed) {
        return maybeParsed;
      }
    }

    return `Interview preparation focus for day ${dayNumber}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1c1a17] font-sans">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="min-w-0">
            <div className="flex flex-col gap-5 border-b border-[#e7e1d4] pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 max-w-4xl">
            <h1
              className="break-words text-3xl leading-tight tracking-tight sm:text-4xl"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {report.title || "Untitled report"}
            </h1>
            <p className="mt-1 text-sm text-[#8a8275]">
              Generated{" "}
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadResume}
                disabled={isDownloadingResume}
                className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#2f5d50] bg-white px-4 text-sm font-medium text-[#2f5d50] transition hover:bg-[#2f5d50] hover:text-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloadingResume ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="40"
                        strokeDashoffset="12"
                      />
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                    Tailored resume
                  </>
                )}
              </button>
            </div>

            <div className="mt-8">
              <div className="flex gap-6 overflow-x-auto border-b border-[#e7e1d4]" role="tablist" aria-label="Report sections">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`shrink-0 pb-3 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? "border-b-2 border-[#c4623f] text-[#1c1a17]"
                        : "text-[#8a8275] hover:text-[#1c1a17]"
                    }`}
                  >
                    {tab.key === "plan" ? planLabel : tab.label}
                    {tab.key !== "plan" && (
                      <span className="ml-1 text-[#8a8275]">
                        ({tab.key === "technical" ? technicalQuestions.length : behavioralQuestions.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "technical" && (
                technicalQuestions.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-[#e7e1d4] bg-white p-5 text-sm text-[#8a8275]">
                    No technical questions generated.
                  </p>
                ) : (
                  <QuestionAccordion
                    questions={technicalQuestions}
                    tabKey="technical"
                    openQuestions={openQuestions}
                    toggleQuestion={toggleQuestion}
                  />
                )
              )}

              {activeTab === "behavioral" && (
                behavioralQuestions.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-[#e7e1d4] bg-white p-5 text-sm text-[#8a8275]">
                    No behavioral questions generated.
                  </p>
                ) : (
                  <QuestionAccordion
                    questions={behavioralQuestions}
                    tabKey="behavioral"
                    openQuestions={openQuestions}
                    toggleQuestion={toggleQuestion}
                  />
                )
              )}

              {activeTab === "plan" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {preparationPlan.length === 0 ? (
                    <p className="rounded-xl border border-[#e7e1d4] bg-white p-5 text-sm text-[#8a8275] sm:col-span-2 xl:col-span-3">
                      No preparation plan available.
                    </p>
                  ) : preparationPlan.map((dayPlan, index) => (
                    <div
                      key={dayPlan._id || dayPlan.day || index}
                      className="rounded-xl border border-[#e7e1d4] bg-white p-4"
                    >
                      <span className="inline-block rounded-md bg-[#2f5d50] px-2 py-0.5 text-xs font-medium text-[#f7f3eb]">
                        Day {dayPlan.day}
                      </span>
                      <p className="mt-2 text-sm font-medium">{getPlanFocus(dayPlan, dayPlan.day || index + 1)}</p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {toArray(dayPlan.tasks).length === 0 ? (
                          <li className="text-xs leading-relaxed text-[#8a8275]">No tasks listed.</li>
                        ) : toArray(dayPlan.tasks).map((task, taskIndex) => (
                          <li
                            key={`${task}-${taskIndex}`}
                            className="flex items-start gap-2 text-xs leading-relaxed text-[#5c564b]"
                          >
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#b7b2a4]" />
                            <span>{sanitizeText(task)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="grid gap-5 sm:grid-cols-2 lg:sticky lg:top-6 lg:grid-cols-1">
            <div className="flex items-center gap-5 rounded-2xl border border-[#e7e1d4] bg-white p-5 lg:flex-col lg:items-center lg:justify-center lg:p-6">
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2f5d50 ${score * 3.6}deg, #e7e1d4 0deg)`,
                }}
              >
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-semibold">{score}%</span>
                </div>
              </div>
              <div className="min-w-0 lg:text-center">
                <p className="text-sm font-medium text-[#5c564b]">Match score</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8a8275]">How closely your background appears to match this role.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e7e1d4] bg-white p-5">
            <p className="text-sm font-medium text-[#1c1a17] mb-3">Skill gaps</p>
            <div className="flex flex-col gap-3">
              {skillGaps.length === 0 ? (
                <p className="text-sm text-[#8a8275]">No skill gaps found.</p>
              ) : skillGaps.map((gap, index) => {
                const tone = severityStyles[gap.severity] || severityStyles.medium;
                return (
                  <div key={gap._id || gap.skill || index} className="flex items-center justify-between gap-4">
                    <span className="min-w-0 break-words text-sm">{gap.skill || "Unnamed skill"}</span>
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium capitalize"
                      style={{ color: tone.text }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: tone.dot }}
                      />
                      {gap.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ReportDetailPage;
