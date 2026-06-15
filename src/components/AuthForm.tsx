import React, { useState } from "react";
import { api } from "../lib/api.ts";
import { User } from "../types.ts";
import { KeyRound, Mail, User as UserIcon, LogIn, Sparkles, AlertCircle } from "lucide-react";

interface AuthFormProps {
  onSuccess: (user: User) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await api.login({ email, password });
        api.setToken(data.token);
        onSuccess(data.user);
      } else {
        const data = await api.register({ email, password, name });
        api.setToken(data.token);
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await api.login({ email: "demo@careerpilot.ai", password: "demo123" });
      api.setToken(data.token);
      onSuccess(data.user);
    } catch (err: any) {
      setError("Demo access failed to initialize. Try manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
          <Sparkles className="w-7 h-7" id="pilot-auth-logo" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white dark:font-semibold tracking-tight">
          {isLogin ? "Welcome to Gowtham CareerPilot AI" : "Launch Your Journey"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          {isLogin ? "Sign in to track, optimize and land your dream job" : "Create an account to unlock AI-powered career growth"}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3.5 mb-5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm border border-rose-150 dark:border-rose-900/50">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-45">
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">FullName</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                id="auth-input-name"
                type="text"
                required
                placeholder="Alex Spencer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="auth-input-email"
              type="email"
              required
              placeholder="alex@careerpilot.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <KeyRound className="w-4 h-4" />
            </span>
            <input
              id="auth-input-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-705 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin"></span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
            </>
          )}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800 -z-10"></span>
        <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase font-semibold">Or Quick Launch</span>
      </div>

      <button
        id="auth-demo-btn"
        onClick={handleDemoAccess}
        disabled={isLoading}
        className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xl text-sm border border-emerald-150 dark:border-emerald-900/40 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        <span>Try Demo System (Quick Log In)</span>
      </button>

      <div className="text-center mt-6">
        <button
          id="auth-mode-toggle"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {isLogin ? "New to Gowtham CareerPilot? Create an account instead" : "Already have an account? Sign in here"}
        </button>
      </div>
    </div>
  );
}
