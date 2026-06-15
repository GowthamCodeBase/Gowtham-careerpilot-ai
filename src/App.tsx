import { useState, useEffect } from "react";
import { api } from "./lib/api.ts";
import { User, JobApplication, Resume, LearningRoadmap, DashboardStats } from "./types.ts";
import AuthForm from "./components/AuthForm.tsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.tsx";
import JobTracker from "./components/JobTracker.tsx";
import ResumeWorkspace from "./components/ResumeWorkspace.tsx";
import CareerGPS from "./components/CareerGPS.tsx";
import AIInsightsView from "./components/AIInsightsView.tsx";
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
  Loader2
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"dashboard" | "tracker" | "resumes" | "gps" | "insights">("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Database application caches
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Initialize and check JWT on startup
  useEffect(() => {
    // Check theme preference
    const savedTheme = localStorage.getItem("career_pilot_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }

    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
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

      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
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
    if (window.confirm("Are you sure you want to sign out from Gowtham CareerPilot AI?")) {
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 transition-colors duration-300">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!isDarkMode)}
            className="p-3 bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-amber-400 cursor-pointer hover:bg-slate-100 transition"
          >
            {isDarkMode ? <Sun className="w-5 h-5 animate-pulse" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <AuthForm onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-850 dark:text-slate-100 overflow-hidden">
      
      {/* --- Sleek Theme Sidebar (Desktop) --- */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md animate-pulse">C</div>
            <span className="text-base font-black tracking-tight text-slate-800 dark:text-white">
              Gowtham CareerPilot<span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </div>
        </div>
        
        {/* Navigation Sidebar Buttons Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 text-xs font-semibold text-left cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic customized pro card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl p-4 text-white shadow-md">
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-85 mb-1">Exclusive AI Pro</p>
            <p className="text-xs font-medium mb-3 leading-relaxed">Predict callback probability metrics utilizing standard AI models.</p>
            <button
              onClick={() => setTab("insights")}
              className="w-full py-1.5 bg-white text-indigo-650 hover:bg-slate-50 font-bold transition rounded-xl text-[10px] shadow-sm cursor-pointer"
            >
              Analyze with insights
            </button>
          </div>
        </div>
      </aside>

      {/* --- Live Workspace Frame Container --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header (Hidden on Desktops) */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-650 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-md">C</div>
            <span className="text-sm font-black tracking-tight text-slate-805 dark:text-white">
              Gowtham CareerPilot<span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-805 text-slate-500 dark:text-amber-400 transition"
              title="Theme setting toggle"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-51 dark:bg-slate-805 text-slate-655 dark:text-white transition"
              title="Nav toggle menu button"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Desktop Custom Workspace Title Bar Header */}
        <header className="hidden md:flex h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white tracking-tight">
              {tab === "dashboard" ? "Dashboard Overview" :
               tab === "tracker" ? "Applications Tracker" :
               tab === "resumes" ? "SaaS Resume Studio" :
               tab === "gps" ? "Career Learning GPS" : "Career Copilot Dynamic Forecasting"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Welcome back, {user.name}. {
                tab === "dashboard" ? `You have ${applications.filter(a => a.status === 'Interview').length} interviews scheduled.` : 
                tab === "tracker" ? `Active tracking processes: ${applications.length} file entries.` :
                tab === "resumes" ? `Review drafted resumes and perform parsing ATS audits.` :
                tab === "gps" ? `Formulate high-performance learn curriculum paths.` : "Generate callback probability forecasts using Gemini prediction engines."
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick theme toggler */}
            <button
              id="desktop-theme-btn"
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl text-slate-500 dark:text-amber-400 transition cursor-pointer border border-slate-100 dark:border-slate-800"
              title="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 animate-pulse" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <span className="h-4 w-px bg-slate-200 dark:bg-slate-800"></span>

            {/* Profile trigger */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700 uppercase p-1">
                {user.name.substring(0, 2)}
              </div>
              <div className="text-left overflow-hidden max-w-[120px]">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
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
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 z-30 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
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
                    className={`flex items-center gap-2 p-3 rounded-xl border transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white border-transparent shadow-sm"
                        : "text-slate-600 bg-slate-50 dark:text-slate-350 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{menuItem.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-500 uppercase">
                  {user.name.substring(0, 2)}
                </div>
                <span className="text-slate-705 dark:text-slate-200">{user.name}</span>
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
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-5 md:p-8">
          <div id="central-view-container" className="max-w-7xl mx-auto w-full space-y-6">
            
            {tab === "dashboard" && dashboardStats && (
              <div className="space-y-6 animate-fade-in">
                <AnalyticsDashboard stats={dashboardStats} />
              </div>
            )}

            {tab === "dashboard" && !dashboardStats && (
              <div className="flex flex-col items-center justify-center py-32 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Formulating Application Analytics...</p>
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

          </div>
        </div>

        {/* Footer info branding block */}
        <footer className="py-4 px-6 text-center border-t border-slate-100 dark:border-slate-850/60 bg-white dark:bg-slate-900 text-slate-400 text-[11px] font-medium tracking-tight shrink-0 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400">© 2026 Google AI Studio Build. Licensed under Apache 2.0.</p>
            <div className="flex gap-4 font-semibold text-slate-500">
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
