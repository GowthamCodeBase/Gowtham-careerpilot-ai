import React, { useState } from "react";
import { api } from "../lib/api.ts";
import { User } from "../types.ts";
import {
  KeyRound,
  Mail,
  User as UserIcon,
  LogIn,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Shield,
  ChevronRight,
} from "lucide-react";

interface AuthFormProps {
  onSuccess: (user: User) => void;
}

const features = [
  {
    icon: Target,
    title: "Job Match Studio",
    desc: "AI-powered compatibility scoring for any job description",
  },
  {
    icon: TrendingUp,
    title: "Career GPS",
    desc: "Personalized learning roadmaps to your dream role",
  },
  {
    icon: Zap,
    title: "Resume Intelligence",
    desc: "Real-time ATS scoring and keyword optimization",
  },
  {
    icon: Shield,
    title: "Application Tracker",
    desc: "Track every application with smart status pipelines",
  },
];

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
      setError("Demo access failed. Try manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.root}>

      {/* ── LEFT PANEL ── */}
      <div style={styles.left}>
        <div style={styles.leftContent}>

          {/* Brand */}
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <span style={styles.brandName}>Gowtham CareerPilot AI</span>
          </div>

          {/* Hero */}
          <div style={styles.heroBlock}>
            <h1 style={styles.heroTitle}>
              Land your<br />
              <span style={styles.heroAccent}>dream job</span><br />
              with AI precision.
            </h1>
            <p style={styles.heroSub}>
              Gowtham's AI-powered career copilot — from resume analysis to
              callback predictions, all in one workspace.
            </p>
          </div>

          {/* Features */}
          <div style={styles.featureList}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={styles.featureItem}>
                  <div style={styles.featureIconWrap}>
                    <Icon size={13} color="#ffffff" />
                  </div>
                  <div>
                    <div style={styles.featureTitle}>{f.title}</div>
                    <div style={styles.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom badge */}
          <div style={styles.badge}>
            <Shield size={12} color="#555555" />
            <span style={styles.badgeText}>Powered by Google Gemini · Secured with JWT</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.right}>
        <div style={styles.card}>

          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrap}>
              <LogIn size={20} color="#000000" strokeWidth={2.2} />
            </div>
            <h2 style={styles.cardTitle}>
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p style={styles.cardSub}>
              {isLogin
                ? "Sign in to your Gowtham CareerPilot workspace"
                : "Start your AI-powered career journey"}
            </p>
          </div>

          {/* Error — red is allowed as indicator color */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={14} color="#dc2626" />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <InputField
                id="auth-input-name"
                label="Full Name"
                type="text"
                placeholder="Gowtham Sai"
                value={name}
                onChange={setName}
                icon={<UserIcon size={14} />}
                focused={focused === "name"}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
            )}

            <InputField
              id="auth-input-email"
              label="Email Address"
              type="email"
              placeholder="you@careerpilot.ai"
              value={email}
              onChange={setEmail}
              icon={<Mail size={14} />}
              focused={focused === "email"}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />

            <InputField
              id="auth-input-password"
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={setPassword}
              icon={<KeyRound size={14} />}
              focused={focused === "password"}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              style={{ ...styles.submitBtn, opacity: isLoading ? 0.7 : 1 }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1a";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#000000";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {isLoading ? (
                <span style={styles.spinner} />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Demo — green is allowed as indicator color */}
          <button
            id="auth-demo-btn"
            onClick={handleDemoAccess}
            disabled={isLoading}
            style={{ ...styles.demoBtn, opacity: isLoading ? 0.6 : 1 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }}
          >
            <Sparkles size={14} color="#16a34a" />
            <span style={styles.demoBtnText}>Try Demo — Instant Access</span>
            <ChevronRight size={13} color="#737373" />
          </button>

          {/* Toggle */}
          <div style={styles.toggleRow}>
            <span style={styles.toggleLabel}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              id="auth-mode-toggle"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              style={styles.toggleBtn}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
              }}
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Input ── */
function InputField({
  id, label, type, placeholder, value, onChange, icon, focused, onFocus, onBlur,
}: {
  id: string; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; icon: React.ReactNode;
  focused: boolean; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <div style={{
        ...styles.inputWrap,
        borderColor: focused ? "#000000" : "#e5e5e5",
        boxShadow: focused ? "0 0 0 3px #e5e5e5" : "none",
      }}>
        <span style={styles.inputIcon}>{icon}</span>
        <input
          id={id}
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          style={styles.input}
        />
      </div>
    </div>
  );
}

/* ── Styles — strict #000 / #fff / grays only ── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Quicksand', sans-serif",
    background: "#ffffff",
  },

  /* ── LEFT ── solid black, white text, dark-gray cards */
  left: {
    flex: "0 0 46%",
    background: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  leftContent: {
    padding: "52px 48px",
    maxWidth: "480px",
    width: "100%",
  },

  /* Brand */
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "56px",
  },
  brandIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#1a1a1a",
    border: "1px solid #2d2d2d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "14px",
    letterSpacing: "-0.2px",
  },

  /* Hero */
  heroBlock: { marginBottom: "40px" },
  heroTitle: {
    color: "#ffffff",
    fontSize: "40px",
    fontWeight: 800,
    lineHeight: 1.18,
    letterSpacing: "-1px",
    margin: 0,
    marginBottom: "14px",
  },
  heroAccent: {
    color: "#ffffff",
    borderBottom: "3px solid #555555",
    paddingBottom: "2px",
  },
  heroSub: {
    color: "#888888",
    fontSize: "13.5px",
    lineHeight: 1.75,
    margin: 0,
    maxWidth: "340px",
  },

  /* Features */
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "44px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#111111",
    border: "1px solid #222222",
  },
  featureIconWrap: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    background: "#1e1e1e",
    border: "1px solid #333333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  featureTitle: {
    color: "#ffffff",
    fontSize: "12.5px",
    fontWeight: 700,
    marginBottom: "2px",
  },
  featureDesc: {
    color: "#666666",
    fontSize: "11.5px",
    lineHeight: 1.5,
  },

  /* Badge */
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  badgeText: {
    color: "#555555",
    fontSize: "11px",
    fontWeight: 500,
  },

  /* ── RIGHT ── solid white, black text */
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    background: "#ffffff",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px 38px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 4px 24px #f0f0f0",
  },

  /* Card header */
  cardHeader: {
    textAlign: "center",
    marginBottom: "28px",
  },
  cardIconWrap: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#f5f5f5",
    border: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#000000",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  cardSub: {
    margin: 0,
    fontSize: "13px",
    color: "#888888",
    fontWeight: 500,
  },

  /* Error — red indicator */
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 13px",
    borderRadius: "9px",
    background: "#fff5f5",
    border: "1px solid #fecaca",
    marginBottom: "18px",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "12.5px",
    fontWeight: 600,
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "18px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.7px",
    color: "#737373",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 13px",
    height: "44px",
    borderRadius: "10px",
    border: "1.5px solid #e5e5e5",
    background: "#fafafa",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  inputIcon: {
    color: "#aaaaaa",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "#000000",
    fontFamily: "inherit",
  },

  /* Submit — black */
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    width: "100%",
    height: "46px",
    borderRadius: "10px",
    background: "#000000",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.15s, opacity 0.2s",
    marginTop: "4px",
    letterSpacing: "-0.1px",
    fontFamily: "inherit",
  },
  spinner: {
    display: "block",
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    border: "2.5px solid #555555",
    borderTopColor: "#ffffff",
    animation: "spin 0.7s linear infinite",
  },

  /* Divider */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "18px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#eeeeee",
  },
  dividerText: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#cccccc",
    whiteSpace: "nowrap" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },

  /* Demo — green indicator allowed */
  demoBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1.5px solid #e5e5e5",
    color: "#000000",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    transition: "background 0.15s",
    marginBottom: "22px",
    fontFamily: "inherit",
  },
  demoBtnText: {
    flex: 1,
    textAlign: "center" as const,
    fontWeight: 700,
    color: "#000000",
  },

  /* Toggle */
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  toggleLabel: {
    fontSize: "12.5px",
    color: "#888888",
    fontWeight: 500,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#000000",
    transition: "text-decoration 0.15s",
    padding: 0,
    fontFamily: "inherit",
  },
};
