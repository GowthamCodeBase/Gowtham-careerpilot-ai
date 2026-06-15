import { useState, useEffect } from "react";
import { AIInsights } from "../types.ts";
import { api } from "../lib/api.ts";
import {
  Brain,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  Loader2,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles,
  Zap
} from "lucide-react";

export default function AIInsightsView() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getAIInsights();
      setInsights(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load predicted insights.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:font-semibold">Career Copilot Dynamic Forecasting</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Let Gemini analyze your current pipelines and recommend optimizations.</p>
        </div>
        <button
          id="btn-recalculate-insights"
          onClick={fetchInsights}
          disabled={isLoading}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Stacks...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Recalculate AI Forecasts</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-455 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-555 animate-spin" />
          <div>
            <h4 className="font-bold text-slate-850 dark:text-white text-base">Conducting Multi-Pipeline Scan...</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Comparing your active applications lists with uploaded resumes. We are formulating predictive interview forecast matrices using Gemini LLMs. Thank you!
            </p>
          </div>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Panel: Probability & Deficit Skills */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Probability Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-950 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                <Brain className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <span>Upcoming Interview Callback Predictor</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tighter text-indigo-300">{insights.interviewProbability}%</span>
                <span className="text-xs font-semibold text-indigo-200">calculated probability</span>
              </div>

              {/* Progress visual */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${insights.interviewProbability}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-505 to-indigo-300 shadow-inner"
                ></div>
              </div>

              <div className="text-xs leading-relaxed text-slate-300 font-medium">
                <span className="font-bold text-indigo-200 block mb-1">Forecast Matrix Justification:</span>
                {insights.probJustification}
              </div>
            </div>

            {/* Missing Skills deficits */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white text-base">Urgent Skills & Knowledge Deficits</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                hiring managers consistently filter resumes that omit these elements. Focus on these tags relative to your active companies:
              </p>

              <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {insights.missingSkillsSuggestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Excellent! No missing tags found.</div>
                  ) : (
                    insights.missingSkillsSuggestions.map((item, idx) => (
                      <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/10 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-white text-xs">{item.skill}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              item.priority === "High" ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400" : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                            }`}>
                              {item.priority} Priority
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">Suggested syllabus: {item.resource}</span>
                        </div>
                        
                        <a
                          href="https://www.google.com/search?q=learn+coding"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Explore Material</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Company Suggestions & Strategic Advice */}
          <div className="space-y-6Col space-y-6">
            
            {/* Suggested Companies recommendation */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white text-base">Al-Matched Company Suggestions</h3>
              </div>
              <p className="text-slate-400 text-xs">
                We mapped your skills against thousands of active job posts. Apply here for improved callback probability:
              </p>

              <div className="space-y-4">
                {insights.suggestedCompanies.map((com, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2.5 bg-slate-50/20 dark:bg-slate-800/10 hover:shadow-xs transition">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-950/25 flex items-center justify-center font-bold text-indigo-600 text-xs">
                        {com.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{com.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      Reason: <span className="font-medium text-slate-600 dark:text-slate-350">{com.reason}</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {com.openRoles.map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[9.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-950/50"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Strategic overall advice */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/30 to-emerald-50/10 dark:from-indigo-950/10 dark:to-emerald-950/5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs uppercase tracking-wide">Overall Strategy Advice</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic font-medium">
                "{insights.overallAdvice}"
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-16 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-400">
          <Brain className="w-12 h-12 mx-auto text-slate-200 animate-pulse mb-3" />
          <h3 className="font-semibold text-slate-800 dark:text-white">No Forecast Calculations Generated</h3>
          <p className="text-xs text-slate-450 mt-1">Recalculate above to audit dynamic forecasts.</p>
        </div>
      )}
    </div>
  );
}
