import React, { useState, useEffect } from "react";
import { Resume, ResumeIntelligence as ResumeIntelligenceType } from "../types.ts";
import { api } from "../lib/api.ts";
import { Loader2, AlertCircle, FileText, CheckCircle2, ChevronRight, RefreshCw, HelpCircle } from "lucide-react";

interface ResumeIntelligenceProps {
  resumes: Resume[];
  onNavigateToResumes: () => void;
}

export default function ResumeIntelligence({ resumes, onNavigateToResumes }: ResumeIntelligenceProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [report, setReport] = useState<ResumeIntelligenceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resumes.length > 0) {
      // Default to the first (latest) resume
      const defaultId = resumes[0].id;
      setSelectedResumeId(defaultId);
      loadReport(defaultId);
    } else {
      setSelectedResumeId("");
      setReport(null);
    }
  }, [resumes]);

  const loadReport = async (resumeId: string) => {
    if (!resumeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getResumeIntelligence(resumeId);
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to compile resume intelligence report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    loadReport(id);
  };

  const handleRefresh = () => {
    if (selectedResumeId) {
      loadReport(selectedResumeId);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl p-8 text-center max-w-lg mx-auto my-12 space-y-6">
        <div className="w-12 h-12 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mx-auto bg-slate-50 dark:bg-slate-900">
          <FileText className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-black dark:text-white">No Resumes Available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Upload your resume first in the Resume Studio to generate ATS optimization, readability grading, and keyword analyses.
          </p>
        </div>
        <button
          onClick={onNavigateToResumes}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 rounded-md text-xs font-bold transition duration-250 cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Go to Resume Studio</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Resume Intelligence</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Deep-audit scoring keyword frequency, impact metrics, action verb density, and AI bullet suggestions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedResumeId}
            onChange={handleResumeChange}
            disabled={isLoading}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition animate-fade-in"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.filename}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition disabled:opacity-50 cursor-pointer"
            title="Re-run Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        /* Skeleton Loading UI */
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
            <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
            <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
            <div className="h-64 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold">Analysis Audit Failed</h4>
            <p className="text-xs leading-normal">{error}</p>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-8">
          
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ATS Score card */}
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl flex flex-col justify-between items-center text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ATS Match Score</h3>
                <p className="text-[10px] text-slate-400">Target parsed algorithm score</p>
              </div>
              <div className="relative w-28 h-28 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-full">
                <span className="text-3xl font-extrabold text-black dark:text-white">{report.atsScore}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {report.atsScore >= 80 
                  ? "Strong parsing formatting. Suitable for general resume screening layers."
                  : "Formatting or keyword issues found. Consider optimizing missing items."}
              </p>
            </div>

            {/* Keyword Coverage card */}
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Keyword Index</h3>
                <p className="text-[10px] text-slate-400">Search relevancy index</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-black dark:text-white">Coverage Rate</span>
                  <span className="text-sm font-extrabold text-black dark:text-white">{report.keywordCoverage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                  <div style={{ width: `${report.keywordCoverage}%` }} className="bg-black dark:bg-white h-full" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Compares skill keywords present in the uploaded document against industry standards for your target role.
              </p>
            </div>

            {/* Impact score card */}
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Achievement Impact</h3>
                <p className="text-[10px] text-slate-400">STAR formula optimization</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-black dark:text-white">Impact Strength</span>
                  <span className="text-sm font-extrabold text-black dark:text-white">{report.impactScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                  <div style={{ width: `${report.impactScore}%` }} className="bg-black dark:bg-white h-full" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Derived from the ratio of strong action verbs and quantified metrics vs generic descriptions.
              </p>
            </div>

          </div>

          {/* Core Analytics Details: Density & Readability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Action Verb Density", value: `${report.actionVerbDensity}%`, desc: "Use of impact verbs (spearheaded, etc)" },
              { label: "Achievement Density", value: `${report.achievementDensity} metrics`, desc: "Bullet points with quantified data" },
              { label: "Readability Grade", value: `Grade ${report.readabilityScore}`, desc: "Flesch-Kincaid read index estimate" }
            ].map((metric, idx) => (
              <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{metric.label}</span>
                <div className="text-lg font-extrabold text-black dark:text-white">{metric.value}</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{metric.desc}</p>
              </div>
            ))}
          </div>

          {/* Missing Keywords Box */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Missing Core Keywords</h3>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Keywords frequently scanned for your target role profile" />
            </div>
            
            {report.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 bg-slate-55 dark:bg-slate-900 rounded-md font-mono"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Excellent! All core keyword credentials for target roles are present.</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400">
              * Note: Incorporate these terms organically into your summary and project lists to pass ATS semantic searches.
            </p>
          </div>

          {/* Side by side optimizations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white">AI Resume Intelligence Recommendations</h3>
            <div className="space-y-4">
              {report.suggestions && report.suggestions.length > 0 ? (
                report.suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl overflow-hidden"
                  >
                    {/* Header bar */}
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs font-bold text-slate-500">
                      <span className="font-mono text-black dark:text-white uppercase tracking-wider">{s.section} Segment</span>
                      <span className="text-[10px] text-slate-400">STAR Suggestion #{idx + 1}</span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Bullet Point</span>
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 line-through leading-relaxed">
                          {s.original}
                        </div>
                      </div>

                      {/* Improved */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optimized Bullet Point</span>
                        <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-black text-xs text-black dark:text-white font-medium leading-relaxed">
                          {s.improved}
                        </div>
                      </div>
                    </div>

                    {/* Footer Reasoning note */}
                    <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950">
                      <span className="font-bold text-slate-500">AI Note:</span> {s.note}
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
                  No automated revision suggestions available.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
          Select a resume above and execute audit to view intelligence outputs.
        </div>
      )}
    </div>
  );
}
