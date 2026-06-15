import React, { useState, useEffect } from "react";
import { Resume, AIAnalysis } from "../types.ts";
import { api } from "../lib/api.ts";
import {
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Compass,
  Zap,
  Check,
  Globe
} from "lucide-react";

interface ResumeWorkspaceProps {
  resumes: Resume[];
  onUploadSuccess: () => Promise<void>;
}

export default function ResumeWorkspace({ resumes, onUploadSuccess }: ResumeWorkspaceProps) {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Paste text or simulate file upload form states
  const [filename, setFilename] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectInput, setShowDirectInput] = useState(false);

  // Auto-select latest resume on load or change
  useEffect(() => {
    if (resumes.length > 0) {
      const active = selectedResume ? resumes.find(r => r.id === selectedResume.id) || resumes[0] : resumes[0];
      setSelectedResume(active);
      loadAnalysis(active.id);
    } else {
      setSelectedResume(null);
      setAnalysis(null);
    }
  }, [resumes]);

  const loadAnalysis = async (resumeId: string) => {
    try {
      const data = await api.getResumeAnalysis(resumeId);
      setAnalysis(data);
    } catch {
      setAnalysis(null); // No analysis yet for this resume
    }
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setAnalysis(null);
    loadAnalysis(resume.id);
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume version? This will erase associated AI reports.")) return;
    try {
      await api.deleteResume(id);
      await onUploadSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete resume.");
    }
  };

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !pasteText) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const fileSize = `${Math.round(pasteText.length / 1024)} KB`;
      await api.createResume({
        filename: filename.endsWith(".pdf") ? filename : filename + ".pdf",
        parseText: pasteText,
        fileSize
      });
      setFilename("");
      setPasteText("");
      setShowDirectInput(false);
      await onUploadSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedResume) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const report = await api.analyzeResume(selectedResume.id);
      setAnalysis(report);
    } catch (err: any) {
      setErrorMessage(err.message || "AI Analysis failed to calculate stats.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Drag & drop file simulating text parsing helper
  const handleFakeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    
    // Read files as text if plain or simulate nicely
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPasteText(content);
        setShowDirectInput(true); // show editor to let user review
      } else {
        // Fallback simulated resume text for standard PDF templates in sandbox
        setPasteText(`${file.name.replace("_", " ")}\nSoftware Dev Consultant\n\nSkills: React, Node, Webpack, JS, CSS, SQL, Git.\n\nExperience:\n- Backend Engineer at TechScale Inc: Built REST APIs and refactored deployment logs.\n- UI Dev at SpeedDesigns.`);
        setShowDirectInput(true);
      }
    };
    reader.readAsText(file);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20";
    if (score >= 60) return "text-amber-500 stroke-amber-500 border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20";
    return "text-rose-500 stroke-rose-500 border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:font-semibold">SaaS Resume Workspace</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage historical draft versions and run ATS evaluation scanners.</p>
      </div>

      {errorMessage && (
        <div className="p-3.5 mb-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-450 text-xs flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of upload panel & listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Version manager & upload zone */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* File Upload Zone */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Draft New Version</h3>
            
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 p-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group">
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 hover:underline">Choose PDF Resume doc</span>
                <p className="text-[10px] text-slate-400 mt-1">drag and drop, or click to choose</p>
              </div>
              <input
                id="file-input-resume"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFakeFileUpload}
                className="hidden"
              />
            </label>

            <button
              id="btn-manual-input"
              onClick={() => {
                setShowDirectInput(!showDirectInput);
                setFilename("");
                setPasteText("");
              }}
              className="w-full text-center py-2 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs text-slate-650 dark:text-slate-300 font-semibold transition cursor-pointer"
            >
              {showDirectInput ? "Hide paste panel" : "Paste raw resume text instead"}
            </button>

            {/* Manual text builder form */}
            {showDirectInput && (
              <form onSubmit={handleAddResume} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Version Identifier Name</label>
                  <input
                    id="resume-manual-title"
                    type="text"
                    required
                    placeholder="e.g. Senior_Fullstack_V2"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Resume Content text</label>
                  <textarea
                    id="resume-manual-text"
                    required
                    rows={4}
                    placeholder="Paste full resume paragraphs, summaries, skills, work timelines here..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition resize-none font-mono text-[10px]"
                  />
                </div>

                <button
                  id="resume-manual-save-btn"
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isUploading ? "Uploading..." : "Save Resume Draft"}
                </button>
              </form>
            )}
          </div>

          {/* Versions list */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Resume Draft Inventory</h3>
            {resumes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No resume versions found. Add your first draft above.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((res) => {
                  const isActive = selectedResume?.id === res.id;
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelectResume(res)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? "bg-indigo-50/50 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-900/60"
                          : "bg-white dark:bg-slate-900 hover:bg-slate-50/50 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{res.filename}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{res.fileSize} • {new Date(res.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResume(res.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition cursor-pointer hover:bg-white dark:hover:bg-slate-850"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis details */}
        <div className="lg:col-span-2">
          {selectedResume ? (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
              
              {/* Active Selection bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-805 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{selectedResume.filename}</h4>
                    <span className="text-[10px] font-mono text-slate-400">UUID: {selectedResume.id}</span>
                  </div>
                </div>

                {!analysis && !isAnalyzing && (
                  <button
                    id="btn-analyze-resume"
                    onClick={handleRunAIAnalysis}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-700 hover:to-indigo-650 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5 self-start shrink-0"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Run Gemini AI ATS Scan</span>
                  </button>
                )}
              </div>

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-base">Conducting ATS System Audit...</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm">
                      Our Gemini AI model is evaluating keywords density, phrasing index alignment, and impact ratios.
                    </p>
                  </div>
                </div>
              )}

              {/* Display analysis results */}
              {!isAnalyzing && analysis && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Score & summary */}
                  <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${getScoreColor(analysis.atsScore)}`}>
                    
                    {/* Ring score */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track ring */}
                        <circle cx="48" cy="48" r="38" className="stroke-slate-100 dark:stroke-slate-800/80" strokeWidth="6" fill="transparent" />
                        {/* Solid Ring */}
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.atsScore / 100)}
                          className="stroke-current"
                        />
                      </svg>
                      <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-850 dark:text-white tracking-tighter">{analysis.atsScore}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">ATS Index</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {analysis.atsScore >= 80 ? "Excellent Match Standards!" : analysis.atsScore >= 60 ? "Moderate Match Potential" : "Critical Improvements Recommended"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed max-w-md">
                        Your file ranks at {analysis.atsScore}% compared to industry job templates. Incorporating the suggested keywords below can boost your profile visibility with automated recruiter pipelines.
                      </p>
                      {analysis.atsScore < 80 && (
                        <button
                          onClick={handleRunAIAnalysis}
                          className="text-xs underline text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 hover:no-underline flex items-center gap-1 mt-1 justify-center sm:justify-start cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" /> Re-Scan resume details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-rose-500" />
                      Missing Keyword Deficits
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {analysis.missingKeywords.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-950"
                        >
                          + {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      Actionable Improvement Suggestions
                    </h4>
                    <ul className="space-y-2.5">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Performance Rewrites segment */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      AI Bullet Point Conversions (STAR Method)
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Rewriting standard tasks into results-oriented impacts. Incorporate these blocks into your PDF layouts for commercial metrics.
                    </p>

                    <div className="space-y-3.5">
                      {analysis.improvedBulletPoints.map((bullet, idx) => {
                        const parts = bullet.split("\nAFTER:");
                        const beforeStr = parts[0]?.replace("BEFORE:", "").trim() || "";
                        const afterStr = parts[1]?.trim() || "";

                        return (
                          <div key={idx} className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3 bg-slate-50/20 dark:bg-slate-800/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-rose-400">Before (Standard)</span>
                                <p className="text-slate-500 text-xs italic leading-relaxed">{beforeStr || bullet}</p>
                              </div>
                              {afterStr && (
                                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-555">AI Quantified Rewrite</span>
                                  <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">{afterStr}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {!analysis && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-805 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-base">ATS Analysis Ready</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                      Click the button below to parse this resume version with Gemini 3.5 LLMs and check your professional matching index.
                    </p>
                    <button
                      id="btn-analyze-resume-secondary"
                      onClick={handleRunAIAnalysis}
                      className="px-5 py-2.5 mt-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Execute Quick Scan Scan</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 space-y-4">
              <FileText className="w-14 h-14 mx-auto text-slate-200 dark:text-slate-800" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No Active Document</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Draft or select a resume draft version from the inventory to load ATS compliance evaluations.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
