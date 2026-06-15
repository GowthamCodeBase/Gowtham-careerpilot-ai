import { DashboardStats } from "../types.ts";
import { FolderGit, Send, BadgeAlert, Trophy, Award, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface AnalyticsDashboardProps {
  stats: DashboardStats;
}

export default function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  // Safe math or fallbacks
  const interviewCount = stats.statusCounts.Interview;
  const appliedCount = stats.statusCounts.Applied;
  const offerCount = stats.statusCounts.Offer;
  const rejectedCount = stats.statusCounts.Rejected;

  // Let's draw standard SVG layout calculations for a custom chart
  // Trend list max value calculation for charting heights
  const maxApps = Math.max(...stats.monthlyTrends.map((t) => t.applications), 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:font-semibold">Performance Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Real-time stats from your active job hunting campaign.</p>
        </div>
      </div>

      {/* KPI Dashboard Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div id="stat-card-total" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Sent</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalCount}</h3>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">Applications</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div id="stat-card-interviews" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Interviews</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{interviewCount}</h3>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">{stats.interviewSuccessRate}% Callbacks</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div id="stat-card-offers" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Offers Landed</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{offerCount}</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Goal Met</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div id="stat-card-rejection" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shadow-inner">
            <BadgeAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rejected</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{rejectedCount}</h3>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">{stats.rejectionRatio}% Trend</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG applications monthly chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white text-base">Timeline Application Trends</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span> Applications
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span> Recruiter Replies
              </span>
            </div>
          </div>

          <div className="relative w-full h-64 flex items-end justify-between border-b border-l border-slate-100 dark:border-slate-800/80 pb-3 pl-3 pt-4">
            {stats.monthlyTrends.map((trend, idx) => {
              // Heights in percentage
              const appHeight = `${(trend.applications / maxApps) * 80 + 10}%`;
              const replyHeight = `${(trend.replies / maxApps) * 80 + 10}%`;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer px-1">
                  {/* Tooltip */}
                  <div className="absolute top-0 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded shadow-md pointer-events-none -translate-y-9 transition-all text-center z-10 w-28 font-mono">
                    <p className="font-semibold text-slate-300">{trend.month}</p>
                    <p className="text-emerald-400 mt-0.5">Apps: {trend.applications}</p>
                    <p className="text-amber-400">Replies: {trend.replies}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* App Bar */}
                    <div
                      style={{ height: appHeight }}
                      className="w-4 sm:w-6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t shadow-sm transition-all duration-300"
                    ></div>
                    {/* Reply Bar */}
                    <div
                      style={{ height: replyHeight }}
                      className="w-4 sm:w-6 bg-gradient-to-t from-amber-400 to-amber-350 rounded-t shadow-sm transition-all duration-300"
                    ></div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono mt-3">{trend.month}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2">Hover columns to audit precise values.</p>
        </div>

        {/* Top applied domains list */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FolderGit className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white text-base">Top Applied Segments</h3>
            </div>

            <div className="space-y-4">
              {stats.domainDistribution.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No segments logged. Add applications.
                </div>
              ) : (
                stats.domainDistribution.map((item, index) => {
                  const widthPercentage = stats.totalCount > 0 ? (item.value / stats.totalCount) * 100 : 0;
                  const barColors = [
                    "bg-indigo-600 dark:bg-indigo-500",
                    "bg-amber-400",
                    "bg-emerald-500",
                    "bg-rose-500",
                    "bg-sky-500"
                  ];
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {item.value} {item.value === 1 ? "app" : "apps"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${widthPercentage}%` }}
                          className={`h-full rounded-full ${barColors[index % barColors.length] || "bg-slate-400"}`}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-50 dark:border-slate-800/80 pt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Targeting highly stable industries yields improved conversions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
