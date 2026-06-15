import { useState, useEffect } from "react";
import { LearningRoadmap } from "../types.ts";
import { api } from "../lib/api.ts";
import {
  Map,
  Plus,
  X,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Milestone,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface CareerGPSProps {
  roadmaps: LearningRoadmap[];
  onGenerateSuccess: () => Promise<void>;
}

const PRESET_SKILLS = [
  "React",
  "TypeScript",
  "HTML & CSS",
  "Node.js",
  "Express",
  "SQL Databases",
  "Git & GitHub",
  "Docker",
  "Python Backend",
  "Amazon AWS",
  "Next.js",
  "NoSQL MongoDB"
];

const PRESET_ROLES = [
  "Senior Generative AI Architect",
  "Staff UI Development Engineer",
  "DevOps Infrastructure Specialist",
  "Principal Security Architect",
  "Lead Developer Advocate Relations"
];

export default function CareerGPS({ roadmaps, onGenerateSuccess }: CareerGPSProps) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<LearningRoadmap | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js"]);
  const [targetRole, setTargetRole] = useState("Senior Generative AI Architect");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roadmaps.length > 0) {
      setSelectedRoadmap(selectedRoadmap ? roadmaps.find(r => r.id === selectedRoadmap.id) || roadmaps[0] : roadmaps[0]);
    } else {
      setSelectedRoadmap(null);
    }
  }, [roadmaps]);

  const handleAddSkill = (skillText: string) => {
    const trimmed = skillText.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setCustomSkill("");
      return;
    }
    setSkills([...skills, trimmed]);
    setCustomSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleTriggerGenerate = async () => {
    if (skills.length === 0) {
      setErrorMessage("Please select at least one current core competence skill.");
      return;
    }
    if (!targetRole.trim()) {
      setErrorMessage("Please enter a clear target role title.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await api.createRoadmap({
        currentSkills: skills,
        targetRole,
      });
      setSelectedRoadmap(result);
      await onGenerateSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Learning path generator failed. Please verify API authorization.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:font-semibold">Career Learning GPS</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Plot AI-driven curriculum trees to transition into elite roles.</p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-450 text-xs flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Roadmap configuration & active output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration Column */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Configure Target Route</h3>
          
          {/* Current Skills Chips builder */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Your Current Stack Skills</label>
            
            <div className="flex flex-wrap gap-1.5 p-3.5 border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-805 rounded-xl min-h-[80px]">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400">Select preset options below or paste tags...</span>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-950"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Manual tag entry */}
            <div className="flex gap-1.5">
              <input
                id="manual-skill-input"
                type="text"
                placeholder="Add other skill, e.g. Go, Java..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(customSkill);
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(customSkill)}
                className="px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Presets Grid */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Stack suggestions</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_SKILLS.map((preset) => {
                  const isSelected = skills.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddSkill(preset)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                        isSelected
                          ? "bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed"
                          : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-650 dark:text-slate-350 hover:bg-slate-50"
                      }`}
                    >
                      + {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Target Career Title</label>
            <input
              id="gps-target-role"
              type="text"
              required
              placeholder="e.g. Senior Generative AI Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
            />
            
            {/* Presets Roles list */}
            <div className="pt-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Popular transitions</span>
              <div className="space-y-1.5 mt-1">
                {PRESET_ROLES.map((roleOpt) => (
                  <button
                    key={roleOpt}
                    type="button"
                    onClick={() => setTargetRole(roleOpt)}
                    className="w-full text-left text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 truncate font-semibold block text-slate-600 dark:text-slate-300 border border-slate-50 dark:border-slate-850 hover:border-slate-150 cursor-pointer"
                  >
                    {roleOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate trigger */}
          <button
            id="gps-generate-btn"
            onClick={handleTriggerGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-700 hover:to-indigo-650 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Calculate learning roadmap</span>
              </>
            )}
          </button>
        </div>

        {/* Roadmap Display Column */}
        <div className="lg:col-span-2">
          {isGenerating ? (
            <div className="p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[400px] flex flex-col justify-center items-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div>
                <h3 className="font-bold text-slate-805 dark:text-white text-base">Synthesizing learning path...</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                  Our Gemini LLM engine is referencing top university sylabbi and active hiring requirements to formulate step-by-step chronologies. Thank you for waiting!
                </p>
              </div>
            </div>
          ) : selectedRoadmap ? (
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
              
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-50 dark:border-slate-808/60 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    Target Syllabus path
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Path to {selectedRoadmap.targetRole}
                  </h3>
                </div>

                {roadmaps.length > 1 && (
                  <select
                    id="gps-roadmap-select-history"
                    value={selectedRoadmap.id}
                    onChange={(e) => setSelectedRoadmap(roadmaps.find(m => m.id === e.target.value) || null)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-805 text-slate-700 dark:text-white border border-slate-150 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
                  >
                    {roadmaps.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.targetRole} (V-{r.id.substring(8, 12)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Learning tree steps list */}
              <div className="relative pl-6 sm:pl-8 border-l border-indigo-100 dark:border-indigo-900/40 space-y-8 py-2">
                {selectedRoadmap.roadmapSteps.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node indicator on Line */}
                    <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm z-10">
                      {idx + 1}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-bold text-slate-850 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {step.title}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-950 self-start">
                          <BookOpen className="w-3 h-3" />
                          {step.timeline}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed max-w-2xl">
                        {step.description}
                      </p>

                      {/* Resource badges lists */}
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-1.5">Best learning resources</span>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-650 dark:text-slate-300 px-3 py-1 rounded-xl shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                              <span>{resource}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Completion checklist Footer */}
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20 flex gap-3 text-xs leading-relaxed items-start">
                <CheckCircle className="w-5 h-5 text-emerald-555 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-400">Roadmap Strategy Ready</h5>
                  <p className="text-slate-600 dark:text-slate-350">
                    Follow the chronological steps outlined above. If you reach competence of step modules, make sure to add them to your resume and scan for ATS scores again!
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 min-h-[400px] flex flex-col justify-center items-center space-y-4">
              <Map className="w-14 h-14 mx-auto text-slate-200 dark:text-slate-800 animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No Path Generated</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Select your current competencies and key target position title on the left panel to map your dynamically plotted learning path.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
