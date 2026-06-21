import React, { useState } from "react";
import { api } from "../lib/api.ts";
import { JobMatchReport, Resume } from "../types.ts";
import { Loader2, AlertCircle, Sparkles, CheckCircle2, ChevronRight, BarChart2, ShieldCheck, FileQuestion } from "lucide-react";

interface JobMatchStudioProps {
  resumes: Resume[];
  onNavigateToResumes: () => void;
}

export default function JobMatchStudio({ resumes, onNavigateToResumes }: JobMatchStudioProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [report, setReport] = useState<JobMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const jobId = `${company.trim() || "Company"}-${jobTitle.trim() || "Job"}-${Math.random().toString(36).substring(2, 6)}`.toLowerCase();
      const res = await api.matchJob(jobId, jobDescription);
      setReport(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze job matching index.");
    } finally {
      setIsLoading(false);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl p-8 text-center max-w-lg mx-auto my-12 space-y-6">
        <div className="w-12 h-12 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mx-auto bg-slate-50 dark:bg-slate-900">
          <FileQuestion className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-black dark:text-white">No Resumes Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            You must upload a resume in the Resume Studio first before matching job descriptions.
          </p>
        </div>
        <button
          onClick={onNavigateToResumes}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 rounded-md text-xs font-bold transition duration-250 cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Upload Resume First</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">AI Job Match Studio</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Paste the job description of your target role to evaluate resume compatibility, missing credentials, and ATS filter predictions.
        </p>
      </div>

      {error && (
        <div className="p-6 border border-slate-250 dark:border-slate-800 bg-white dark:bg-black text-red-650 dark:text-red-450 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-sans">Matching Engine Failure</h4>
            <p className="text-xs leading-normal">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleMatch} className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Analyze Opportunity</h3>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Full Stack Architect"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
              <textarea
                required
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the raw text of the role requirements here..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition font-sans resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compute Match Score</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            /* Skeleton Loading UI */
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl p-6 space-y-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full"></div>
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-slate-50 dark:bg-slate-950 w-1/2"></div>
                  <div className="h-3 bg-slate-50 dark:bg-slate-950 w-3/4"></div>
                </div>
              </div>
              <div className="h-28 bg-slate-50 dark:bg-slate-950 rounded-lg"></div>
              <div className="h-28 bg-slate-50 dark:bg-slate-950 rounded-lg"></div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              
              {/* Top Score Dashboard */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Compatibility Assessment</h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Match Score</span>
                    <div className="text-2xl font-black text-black dark:text-white">{report.matchScore}%</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-800/20 max-w-16 mx-auto">
                      <div style={{ width: `${report.matchScore}%` }} className="bg-black dark:bg-white h-full" />
                    </div>
                  </div>

                  <div className="space-y-1 border-x border-slate-100 dark:border-slate-900 px-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Callback Odds</span>
                    <div className="text-2xl font-black text-black dark:text-white">{report.interviewProbability}%</div>
                    <span className="text-[8px] text-slate-400 font-medium">Estimated callback</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ATS Rank Est.</span>
                    <div className="text-2xl font-black text-black dark:text-white">#{report.atsRankingEstimate}</div>
                    <span className="text-[8px] text-slate-400 font-medium">Out of 100 profiles</span>
                  </div>
                </div>
              </div>

              {/* Strong Areas Matches */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Strong Match Coverage</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {report.strongAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-black dark:text-white rounded-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Requirements Gap */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Missing Requirements Gap</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Incorporate these missing qualifications into your resume details to pass candidate filters:
                </p>

                <div className="space-y-2">
                  {report.missingSkills.map((sk, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-650 dark:text-slate-350">
                      <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
                      <span>{sk}</span>
                    </div>
                  ))}
                  {report.missingSkills.length === 0 && (
                    <p className="text-xs text-slate-500">Perfect alignment! No missing qualifications found.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 bg-white dark:bg-black h-full flex flex-col items-center justify-center min-h-[300px] space-y-2">
              <BarChart2 className="w-8 h-8 text-slate-300" />
              <span>Input details and target description to calculate match analysis.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
