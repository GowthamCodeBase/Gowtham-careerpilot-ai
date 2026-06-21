import { useState, useEffect, lazy, Suspense } from "react";
import { api } from "./lib/api.ts";
import { User, JobApplication, Resume, LearningRoadmap } from "./types.ts";
import AuthForm from "./components/AuthForm.tsx";

// Lazy loading feature pages for optimized bundle size & page lifecycle
const JobTracker = lazy(() => import("./components/JobTracker.tsx"));
const ResumeWorkspace = lazy(() => import("./components/ResumeWorkspace.tsx"));
const CareerGPS = lazy(() => import("./components/CareerGPS.tsx"));
const AIInsightsView = lazy(() => import("./components/AIInsightsView.tsx"));
const CareerCommandCenter = lazy(() => import("./components/CareerCommandCenter.tsx"));
const ResumeIntelligence = lazy(() => import("./components/ResumeIntelligence.tsx"));
const SkillGapView = lazy(() => import("./components/SkillGapView.tsx"));
const JobMatchStudio = lazy(() => import("./components/JobMatchStudio.tsx"));

import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MapPin,
  BrainCircuit,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  Compass,
  Zap,
  User as UserIcon,
  Loader2,
  Award
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<
    | "dashboard"
    | "resume_intelligence"
    | "skill_gap"
    | "job_match"
    | "tracker"
    | "resumes"
    | "gps"
    | "insights"
  >("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Database application caches
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);

  // Initialize and check JWT on startup
  useEffect(() => {
    // Check theme preference
    const savedTheme = localStorage.getItem("career_pilot_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }

    // Always show login screen on initial page load
    api.logout();
    setIsInitializing(false);
  }, []);

  // Fetch all states whenever authenticated user updates
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    try {
      const authApps = await api.getApplications();
      setApplications(authApps);
      
      const authResumes = await api.getResumes();
      setResumes(authResumes);

      const authRoadmaps = await api.getRoadmaps();
      setRoadmaps(authRoadmaps);
    } catch (err) {
      console.error("Failed to sync secure database logs:", err);
    }
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("career_pilot_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("career_pilot_theme", "light");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from Gowtham Career Pilot AI?")) {
      api.logout();
      setUser(null);
    }
  };

  // Tracker CRUD wrappers linked to central caching refresh
  const handleCreateApplication = async (payload: any) => {
    await api.createApplication(payload);
    await refreshData();
  };

  const handleUpdateApplication = async (id: string, payload: any) => {
    await api.updateApplication(id, payload);
    await refreshData();
  };

  const handleDeleteApplication = async (id: string) => {
    if (window.confirm("Delete this applications log file? This cannot be undone.")) {
      await api.deleteApplication(id);
      await refreshData();
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 animate-pulse font-mono mt-2">Checking Career Security Context...</p>
        </div>
      </div>
    );
  }

  // --- Login Screen Fallback ---
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", width: "100%" }}>
        <AuthForm onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black font-sans text-black dark:text-white overflow-hidden">
      
      {/* --- Sleek Theme Sidebar (Desktop) --- */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800 flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black tracking-tight text-black dark:text-white">
              Gowtham Career Pilot AI
            </span>
          </div>
        </div>
        
        {/* Navigation Sidebar Buttons Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
            { id: "resume_intelligence", label: "Resume Intelligence", icon: FileText },
            { id: "skill_gap", label: "Skill Gap Analysis", icon: Award },
            { id: "job_match", label: "Job Match Studio", icon: Sparkles },
            { id: "tracker", label: "Job Tracker", icon: Briefcase },
            { id: "resumes", label: "Resume Studio", icon: FileText },
            { id: "gps", label: "Career GPS", icon: Compass },
            { id: "insights", label: "Copilot Insights", icon: BrainCircuit }
          ].map((menuItem) => {
            const Icon = menuItem.icon;
            const isActive = tab === menuItem.id;
            return (
              <button
                key={menuItem.id}
                onClick={() => setTab(menuItem.id as any)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md border transition duration-200 text-xs font-bold text-left cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-slate-400"}`} />
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic customized pro card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-black rounded-lg p-4 text-black dark:text-white shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Career Copilot Pro</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">Predict callback probability metrics using Gemini intelligence.</p>
            <button
              onClick={() => setTab("insights")}
              className="w-full py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 font-bold transition rounded-md text-[10px] cursor-pointer"
            >
              Evaluate Career Forecasts
            </button>
          </div>
        </div>
      </aside>

      {/* --- Live Workspace Frame Container --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header (Hidden on Desktops) */}
        <header className="md:hidden h-16 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-black dark:text-white">
              Gowtham Career Pilot AI
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-amber-400 transition"
              title="Theme setting toggle"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-white transition"
              title="Nav toggle menu button"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Desktop Custom Workspace Title Bar Header */}
        <header className="hidden md:flex h-20 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tight">
              {tab === "dashboard" ? "Career Command Center" :
               tab === "resume_intelligence" ? "Resume Intelligence Report" :
               tab === "skill_gap" ? "Skill Gap Engine" :
               tab === "job_match" ? "Job Match Studio" :
               tab === "tracker" ? "Applications Tracker" :
               tab === "resumes" ? "Resume Workspace" :
               tab === "gps" ? "Career Learning GPS" : "Career Copilot Forecasting"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium font-sans">
              Welcome back, {user.name}. {
                tab === "dashboard" ? `You have ${applications.filter(a => a.status === 'Interview').length} active interviews.` : 
                tab === "resume_intelligence" ? "Detailed ATS scoring and keyword analysis report." :
                tab === "skill_gap" ? "Compare inventory to target role competencies." :
                tab === "job_match" ? "Interactive compatibility scoring for pasted JDs." :
                tab === "tracker" ? `Active tracking processes: ${applications.length} applications.` :
                tab === "resumes" ? "Manage and parse resume versions." :
                tab === "gps" ? "Synthesize tailored learning paths with Career GPS." :
                "Generate callback probability predictions using AI engines."
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick theme toggler */}
            <button
              id="desktop-theme-btn"
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-amber-400 transition cursor-pointer border border-slate-200 dark:border-slate-800"
              title="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 animate-pulse" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <span className="h-4 w-px bg-slate-200 dark:bg-slate-800"></span>

            {/* Profile trigger */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 uppercase p-1">
                {user.name.substring(0, 2)}
              </div>
              <div className="text-left overflow-hidden max-w-[120px]">
                <p className="text-xs font-bold text-black dark:text-white truncate">{user.name}</p>
                <button
                  id="desktop-logout-btn"
                  onClick={handleLogout}
                  className="text-[10px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer block leading-none mt-0.5"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Nav Dropdown menu drawers */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 z-30 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
                { id: "resume_intelligence", label: "Resume Intelligence", icon: FileText },
                { id: "skill_gap", label: "Skill Gap Analysis", icon: Award },
                { id: "job_match", label: "Job Match Studio", icon: Sparkles },
                { id: "tracker", label: "Job Tracker", icon: Briefcase },
                { id: "resumes", label: "Resume Studio", icon: FileText },
                { id: "gps", label: "Career GPS", icon: Compass },
                { id: "insights", label: "Copilot Insights", icon: BrainCircuit }
              ].map((menuItem) => {
                const Icon = menuItem.icon;
                const isActive = tab === menuItem.id;
                return (
                  <button
                    key={menuItem.id}
                    onClick={() => {
                      setTab(menuItem.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-md border transition cursor-pointer ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                        : "text-slate-500 bg-white dark:text-slate-400 dark:bg-black border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{menuItem.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-indigo-500 uppercase">
                  {user.name.substring(0, 2)}
                </div>
                <span className="text-black dark:text-white">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-3 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Viewport Dynamic Frame scrollable container */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-black p-5 md:p-8">
          <div id="central-view-container" className="max-w-7xl mx-auto w-full space-y-6">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-32 space-y-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Synchronizing Page Environment...</p>
              </div>
            }>
              {tab === "dashboard" && (
                <div className="space-y-6 animate-fade-in">
                  <CareerCommandCenter
                    onNavigate={(target) => {
                      if (target === "resumes") setTab("resumes");
                      else if (target === "resume_intelligence") setTab("resume_intelligence");
                      else if (target === "skill_gap") setTab("skill_gap");
                      else if (target === "job_match") setTab("job_match");
                      else if (target === "tracker") setTab("tracker");
                      else if (target === "gps") setTab("gps");
                      else if (target === "insights") setTab("insights");
                    }}
                    applications={applications}
                  />
                </div>
              )}

              {tab === "resume_intelligence" && (
                <div className="space-y-6 animate-fade-in">
                  <ResumeIntelligence
                    resumes={resumes}
                    onNavigateToResumes={() => setTab("resumes")}
                  />
                </div>
              )}

              {tab === "skill_gap" && (
                <div className="space-y-6 animate-fade-in">
                  <SkillGapView
                    onNavigateToGPS={() => setTab("gps")}
                  />
                </div>
              )}

              {tab === "job_match" && (
                <div className="space-y-6 animate-fade-in">
                  <JobMatchStudio
                    resumes={resumes}
                    onNavigateToResumes={() => setTab("resumes")}
                  />
                </div>
              )}

              {tab === "tracker" && (
                <div className="space-y-6 animate-fade-in">
                  <JobTracker
                    applications={applications}
                    onCreate={handleCreateApplication}
                    onUpdate={handleUpdateApplication}
                    onDelete={handleDeleteApplication}
                  />
                </div>
              )}

              {tab === "resumes" && (
                <div className="space-y-6 animate-fade-in">
                  <ResumeWorkspace
                    resumes={resumes}
                    onUploadSuccess={refreshData}
                  />
                </div>
              )}

              {tab === "gps" && (
                <div className="space-y-6 animate-fade-in">
                  <CareerGPS
                    roadmaps={roadmaps}
                    onGenerateSuccess={refreshData}
                  />
                </div>
              )}

              {tab === "insights" && (
                <div className="space-y-6 animate-fade-in">
                  <AIInsightsView />
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* Footer info branding block */}
        <footer className="py-4 px-6 text-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-slate-400 text-[11px] font-medium tracking-tight shrink-0 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 font-sans">© 2026 Google AI Studio Build. Licensed under Apache 2.0.</p>
            <div className="flex gap-4 font-semibold text-slate-500 font-mono">
              <a href="https://ai.studio/build" target="_blank" rel="noreferrer" className="hover:underline">Studio Build</a>
              <span>•</span>
              <a href="https://github.com/google/genai" target="_blank" rel="noreferrer" className="hover:underline">@google/genai SDK</a>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
