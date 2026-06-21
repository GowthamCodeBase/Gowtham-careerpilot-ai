import React, { useState, useEffect } from "react";
import { api } from "../lib/api.ts";
import { SkillAnalysis, CareerProfile } from "../types.ts";
import { Loader2, AlertCircle, Award, CheckCircle2, ChevronRight, HelpCircle, Edit2, Check, X, Plus, Trash2 } from "lucide-react";

interface SkillGapViewProps {
  onNavigateToGPS: () => void;
}

export default function SkillGapView({ onNavigateToGPS }: SkillGapViewProps) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for editing profile
  const [editTargetRole, setEditTargetRole] = useState("");
  const [editCurrentRole, setEditCurrentRole] = useState("");
  const [editYearsExperience, setEditYearsExperience] = useState(3);
  const [editSkills, setEditSkills] = useState<{ name: string; level: string; years: number }[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile
      const prof = await api.getCareerProfile();
      setProfile(prof);
      
      // Initialize edit form states
      setEditTargetRole(prof.targetRole || "");
      setEditCurrentRole(prof.currentRole || "");
      setEditYearsExperience(prof.yearsExperience || 3);
      setEditSkills(prof.skills || []);

      // 2. Fetch Skill Gap analysis
      const ana = await api.getSkillGap();
      setAnalysis(ana);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load skill analysis data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = editSkills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;

    setEditSkills([...editSkills, {
      name: newSkillName.trim(),
      level: newSkillLevel,
      years: 1
    }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    const copy = [...editSkills];
    copy.splice(index, 1);
    setEditSkills(copy);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload = {
        ...profile,
        currentRole: editCurrentRole,
        targetRole: editTargetRole,
        yearsExperience: Number(editYearsExperience),
        skills: editSkills
      };
      const updatedProfile = await api.updateCareerProfile(payload);
      setProfile(updatedProfile);
      
      // Re-trigger analysis
      const ana = await api.getSkillGap();
      setAnalysis(ana);
      
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update career profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading && !analysis) {
    return (
      <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
        <div className="h-20 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
          <div className="h-96 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">AI Skill Gap Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Map target role skills against your inventory to prioritize learning and identify credential matches.
          </p>
        </div>
        {!isEditing && profile && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Target Role Profile</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-6 border border-slate-250 dark:border-slate-800 bg-white dark:bg-black text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold">Operation Error</h4>
            <p className="text-xs leading-normal">{error}</p>
          </div>
        </div>
      )}

      {/* Editing Form Section */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
            <h3 className="text-sm font-bold text-black dark:text-white">Update Target & Skill Inventory</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Role</label>
              <input
                type="text"
                required
                value={editCurrentRole}
                onChange={(e) => setEditCurrentRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
              <input
                type="text"
                required
                value={editTargetRole}
                onChange={(e) => setEditTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                required
                value={editYearsExperience}
                onChange={(e) => setEditYearsExperience(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
              />
            </div>
          </div>

          {/* Core Skill inventory list modifier */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900">
            <h4 className="text-xs font-bold text-black dark:text-white">Active Skills Inventory</h4>
            
            <div className="flex flex-wrap gap-2 min-h-10 p-3 border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 rounded-lg">
              {editSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md flex items-center gap-1.5"
                >
                  <span>{s.name} ({s.level})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {editSkills.length === 0 && (
                <span className="text-[10px] text-slate-400 font-mono">No skills added to list. Use add tool below.</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
              <div className="flex-1 space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Skill Name</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Redis, Docker"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
                />
              </div>

              <div className="w-full sm:w-32 space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Skill Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-black dark:text-white rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-900 pt-4">
            <button
              type="button"
              disabled={isSavingProfile}
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-md transition duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 text-xs font-bold rounded-md transition duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Main Analysis Display Panels */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Role Skill Match Matrix */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Skill Inventory Overlap</h3>
              <p className="text-[10px] text-slate-400">Target role: {analysis.targetRole}</p>
            </div>

            <div className="space-y-4">
              {analysis.existingSkills.map((sk, idx) => {
                const reqData = analysis.requiredSkills.find(r => r.name.toLowerCase() === sk.name.toLowerCase());
                return (
                  <div key={idx} className="p-3 border border-slate-100 dark:border-slate-900 bg-white dark:bg-black rounded-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-black dark:text-white">{sk.name}</span>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Typical Level: {reqData?.typicalLevel || "Advanced"} | Importance: {reqData?.importance || "Medium"}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        sk.match
                          ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                          : "border-dashed border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-black dark:text-slate-500"
                      }`}
                    >
                      {sk.match ? `Matched (${sk.currentLevel})` : "Missing"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing Skills Prioritization and Roadmap Synthesis */}
          <div className="space-y-6">
            
            {/* Missing Skills Priority Box */}
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Missing Skills Priority Gap</h3>
                <p className="text-[10px] text-slate-400">Ranked learning list derived from O*NET database profiles</p>
              </div>

              <div className="space-y-3">
                {analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((sk, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 dark:border-slate-900 bg-white dark:bg-black rounded-lg flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-black dark:text-white">{sk.name}</span>
                        <p className="text-[9px] text-slate-400">Target Timeline: {sk.learningTimeline}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          sk.priority === "High"
                            ? "border border-red-200 bg-white text-red-650 dark:border-red-950 dark:bg-black dark:text-red-400"
                            : "border border-slate-200 bg-white text-slate-650 dark:border-slate-800 dark:bg-black dark:text-slate-400"
                        }`}
                      >
                        {sk.priority} Priority
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <span>Fantastic! Zero skill gaps identified for your target role.</span>
                  </div>
                )}
              </div>

              {analysis.missingSkills.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={onNavigateToGPS}
                    className="w-full py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 text-xs font-bold rounded-md transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Synthesize Curriculum in Career GPS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Certifications Box */}
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Recommended Credentials</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Earning these certifications will significantly boost your CV weight for ATS semantic layers:
              </p>

              <div className="space-y-2">
                {analysis.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
