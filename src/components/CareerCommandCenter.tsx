import React, { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { CareerHealthScore, JobApplication, AIInsights } from "../types.ts";
import { Loader2, ArrowRight, ShieldCheck, RefreshCw, Sparkles, Award, ClipboardCheck, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface CareerCommandCenterProps {
  onNavigate: (tab: "resumes" | "gps" | "insights" | "tracker" | "skill_gap" | "job_match" | "resume_intelligence") => void;
  applications: JobApplication[];
}

export default function CareerCommandCenter({ onNavigate, applications }: CareerCommandCenterProps) {
  const [healthScore, setHealthScore] = useState<CareerHealthScore | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Recommendations Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const score = await api.getCareerHealthScore();
      setHealthScore(score);
      
      const fore = await api.getForecast();
      setForecast(fore);

      const insights = await api.getAIInsights();
      setAiInsights(insights);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncScore = async () => {
    setIsSyncing(true);
    try {
      const score = await api.getCareerHealthScore();
      setHealthScore(score);
      const fore = await api.getForecast();
      setForecast(fore);
      const insights = await api.getAIInsights();
      setAiInsights(insights);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applications]);

  // Compute Funnel Metrics from Job Applications
  const totalApps = applications.length;
  const interviewApps = applications.filter(a => a.status === "Interview" || a.status === "Offer").length;
  const offerApps = applications.filter(a => a.status === "Offer").length;
  const rejectedApps = applications.filter(a => a.status === "Rejected").length;

  const interviewRate = totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) : 0;
  const offerRate = totalApps > 0 ? Math.round((offerApps / totalApps) * 100) : 0;

  // Carousel Items based on AI Insights
  const carouselItems: { title: string; type: "advice" | "skills" | "companies"; content: React.ReactNode }[] = [];
  
  if (aiInsights) {
    carouselItems.push({
      title: "Coaching Advisor Advice",
      type: "advice",
      content: (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
            {aiInsights.overallAdvice}
          </p>
        </div>
      )
    });

    if (aiInsights.missingSkillsSuggestions && aiInsights.missingSkillsSuggestions.length > 0) {
      carouselItems.push({
        title: "Priority Upskilling Path",
        type: "skills",
        content: (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400">Target skill gap prioritizations:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {aiInsights.missingSkillsSuggestions.slice(0, 4).map((s, idx) => (
                <div key={idx} className="p-2 border border-slate-100 dark:border-slate-900 rounded-md bg-white dark:bg-black flex justify-between items-center">
                  <span className="font-bold">{s.skill}</span>
                  <span className="text-[9px] px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded font-mono uppercase text-slate-500">
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      });
    }

    if (aiInsights.suggestedCompanies && aiInsights.suggestedCompanies.length > 0) {
      carouselItems.push({
        title: "Recommended Companies",
        type: "companies",
        content: (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-sans">Target high-match openings:</p>
            <div className="space-y-2">
              {aiInsights.suggestedCompanies.slice(0, 2).map((c, idx) => (
                <div key={idx} className="p-2 border border-slate-100 dark:border-slate-900 rounded-md bg-white dark:bg-black space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold">{c.name}</span>
                    <span className="text-[8px] font-mono text-slate-400">{c.openRoles.join(", ")}</span>
                  </div>
                  <p className="text-[10px] text-slate-550 leading-snug">{c.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )
      });
    }
  }

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
        <p className="text-xs font-mono text-slate-400">Synchronizing Career Health Statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Career Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-sans">
            Enterprise portfolio workspace tracking overall readiness, skill gaps, and interview odds.
          </p>
        </div>
        <button
          onClick={handleSyncScore}
          disabled={isSyncing}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Scorecard"}</span>
        </button>
      </div>

      {/* Main Grid: Health score and sub scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Career Health Dial */}
        <div className="lg:col-span-1 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Career Health Index</h3>
            <p className="text-[10px] text-slate-400">Derived weighted calculation</p>
          </div>

          <div className="relative w-36 h-36 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-850 rounded-full">
            <span className="text-4xl font-extrabold tracking-tighter text-black dark:text-white">
              {healthScore?.overallScore || 70}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">/ 100</span>
          </div>

          <div className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
            Overall competency based on resume completeness, targeted role skillset matching, application pace, and roadmap progression.
          </div>
        </div>

        {/* Right Side: Categorized sub scores */}
        <div className="lg:col-span-2 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Scorecard Breakdown</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Resume Completeness", val: healthScore?.resumeScore || 70, desc: "ATS formatting & keyword coverage", tab: "resume_intelligence" as const },
              { label: "Skill Inventory Match", val: healthScore?.skillScore || 65, desc: "Profile overlap against role target", tab: "skill_gap" as const },
              { label: "Application Pace Efficiency", val: healthScore?.applicationScore || 60, desc: "Volume velocity and response tracking", tab: "tracker" as const },
              { label: "Roadmap Curriculum Steps", val: healthScore?.roadmapScore || 75, desc: "GPS milestones completed", tab: "gps" as const }
            ].map((sub, idx) => (
              <div key={idx} className="p-4 border border-slate-100 dark:border-slate-900 bg-white dark:bg-black rounded-lg flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-black dark:text-white">{sub.label}</span>
                  <span className="text-sm font-black text-slate-500">{sub.val}%</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div style={{ width: `${sub.val}%` }} className="bg-black dark:bg-white h-full" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">{sub.desc}</p>
                </div>
                <button
                  onClick={() => onNavigate(sub.tab)}
                  className="text-[10px] font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer self-start"
                >
                  <span>Audit view</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Analytics & Forecast Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Forecast Card */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Callback Probability Forecast</h3>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-black dark:text-white">
                {forecast?.interviewProbability || 67}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Interview Callback Odds</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div style={{ width: `${forecast?.interviewProbability || 67}%` }} className="bg-black dark:bg-white h-full" />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            {forecast?.forecastJustification || "Calculating callback estimation from active database logs..."}
          </p>
        </div>

        {/* Application Funnel Card */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Application Funnel Analytics</h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 font-sans">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Applied: <strong>{totalApps}</strong></span>
              <span>Interviews: <strong>{interviewApps}</strong> ({interviewRate}%)</span>
              <span>Offers: <strong>{offerApps}</strong> ({offerRate}%)</span>
            </div>

            <div className="space-y-2 pt-1">
              {/* Funnel visualization bars */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Applications Intake</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-md overflow-hidden">
                  <div className="bg-slate-300 dark:bg-slate-700 h-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Interview Screening Conversion</span>
                  <span>{interviewRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-md overflow-hidden">
                  <div style={{ width: `${interviewRate}%` }} className="bg-slate-600 dark:bg-slate-400 h-full animate-fade-in" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Offers Placement Rate</span>
                  <span>{offerRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-md overflow-hidden">
                  <div style={{ width: `${offerRate}%` }} className="bg-black dark:bg-white h-full animate-fade-in" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Recommendations Carousel Panel */}
      {carouselItems.length > 0 && (
        <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                AI Coach: {carouselItems[carouselIndex].title}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={prevSlide}
                className="p-1 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-1">
                {carouselIndex + 1} / {carouselItems.length}
              </span>
              <button
                onClick={nextSlide}
                className="p-1 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="min-h-24 py-2">
            {carouselItems[carouselIndex].content}
          </div>
        </div>
      )}

      {/* Action Center Shortcut Panel */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-xl space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Operating Shortcuts</h3>
          <p className="text-[10px] text-slate-400">Trigger standard workflow processes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-center">
          <button
            onClick={() => onNavigate("job_match")}
            className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-black dark:text-white rounded-md cursor-pointer transition font-mono"
          >
            JD Match Studio
          </button>
          <button
            onClick={() => onNavigate("skill_gap")}
            className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-black dark:text-white rounded-md cursor-pointer transition font-mono"
          >
            Analyze Skills
          </button>
          <button
            onClick={() => onNavigate("resume_intelligence")}
            className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-black dark:text-white rounded-md cursor-pointer transition font-mono"
          >
            ATS Score Audit
          </button>
        </div>
      </div>
    </div>
  );
}
