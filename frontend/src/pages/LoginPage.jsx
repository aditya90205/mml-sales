import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart, ShieldCheck, HeartHandshake, Headset, Users } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLogo from "../assets/mml-logo.png";
import loginLeftImage from "../assets/login-left-image.png";
import loginInsideFormImage from "../assets/login-inside-form-image.png";

const FEATURES = [
  { icon: Users, label: "Verified\nProfiles" },
  { icon: ShieldCheck, label: "Secure &\nTrusted" },
  { icon: HeartHandshake, label: "Personalized\nMatchmaking" },
  { icon: Headset, label: "Dedicated\nSupport" },
];

const STATS = [
  { value: "17+", label: "Years of Experience" },
  { value: "1000+", label: "Successful Matches" },
  { value: "4+", label: "Locations in India & Overseas" },
  { value: "Global Reach", label: "Indian & NRI Families" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter your username and password.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Welcome back!");
      navigate("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FCF6F1]">
      {/* ── Left: brand / info panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[50%] relative flex-col overflow-hidden bg-[#FCF6F1]">
        {/* floral corner accents */}
        <svg
          className="absolute -top-6 -left-10 w-56 h-56 text-[#7A0A17]/15 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <path d="M20 10c30 10 50 40 45 80-30-5-60-30-70-60-3-9 12-24 25-20Z" fill="currentColor" />
          <path d="M10 60c25 5 45 30 45 65-25 0-50-20-58-45-4-12 5-22 13-20Z" fill="currentColor" />
          <circle cx="35" cy="30" r="4" fill="currentColor" />
          <circle cx="60" cy="15" r="3" fill="currentColor" />
          <circle cx="15" cy="90" r="3" fill="currentColor" />
        </svg>

        <div className="relative z-10 flex flex-col flex-1 px-8 xl:px-12 pt-10 pb-0 min-h-0">
          {/* Logo */}
          <div className="flex justify-center shrink-0">
            <img src={mmlLogo} alt="Make My Lagan Matrimonials" className="h-24 xl:h-28 w-auto object-contain" />
          </div>

          {/* Headline */}
          <div className="text-center mt-6 shrink-0">
            <h1 className="font-display text-[26px] xl:text-[30px] leading-tight text-[#1F1B1A]">
              Bringing Hearts Together,
              <br />
              Building <span className="text-[#7A0A17] font-semibold">Beautiful Futures.</span>
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="h-px w-14 bg-[#7A0A17]/25" />
              <Heart size={14} className="text-[#7A0A17]/60" fill="currentColor" />
              <span className="h-px w-14 bg-[#7A0A17]/25" />
            </div>
          </div>

          {/* Feature row */}
          <div className="flex items-start justify-center gap-6 xl:gap-10 mt-7 shrink-0">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2 w-[90px]">
                <span className="size-14 rounded-full bg-[#FBE7E7] text-[#7A0A17] grid place-items-center">
                  <f.icon size={22} strokeWidth={1.8} />
                </span>
                <p className="text-[12.5px] font-semibold text-[#3A3230] text-center leading-snug whitespace-pre-line">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="flex-1 min-h-0 mt-6 flex items-end justify-center overflow-hidden">
            <img
              src={loginLeftImage}
              alt=""
              className="w-full max-w-[560px] h-auto object-contain object-bottom"
              aria-hidden
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 grid grid-cols-4 bg-[#7A0A17] shrink-0">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-1 text-center px-2 py-5 border-l border-white/12 first:border-l-0"
            >
              <span className="text-lg xl:text-xl font-bold text-white leading-none">{s.value}</span>
              <span className="text-[10.5px] xl:text-[11px] text-white/75 leading-tight max-w-[110px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: sign-in panel ── */}
      <div className="relative flex-1 min-h-screen flex items-center justify-center p-5 sm:p-8 lg:p-12 overflow-hidden">
        <img
          src={loginInsideFormImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden />

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-[400px] bg-[#FCF6F1]/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] px-7 py-8 sm:px-9 sm:py-9 flex flex-col"
        >
          {/* mobile-only logo (left panel is hidden below lg) */}
          <div className="flex lg:hidden justify-center mb-5">
            <img src={mmlLogo} alt="Make My Lagan Matrimonials" className="h-20 w-auto object-contain" />
          </div>
          <div className="hidden lg:flex justify-center mb-5">
            <img src={mmlLogo} alt="Make My Lagan Matrimonials" className="h-16 w-auto object-contain" />
          </div>

          <div className="text-center">
            <p className="text-[15px] text-[#3A3230]">
              Welcome Back,
            </p>
            <h2 className="font-display text-[26px] font-semibold text-[#7A0A17] mt-0.5">Team MML!</h2>
            <p className="text-[12.5px] text-[#6B6058] mt-2">Sign in to access your CRM dashboard.</p>
          </div>

          <div className="flex flex-col gap-4 mt-7">
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserRound size={16} />}
              wrapperClassName="gap-1.5"
              className="h-11 bg-white/90"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              className="h-11 bg-white/90"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pointer-events-auto text-[#8f95a5] hover:text-[#3A3230] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex justify-end -mt-1.5">
              <button
                type="button"
                onClick={() => toast.info("Please contact your admin to reset your password.")}
                className="text-[12.5px] font-medium text-[#7A0A17] hover:underline underline-offset-2"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="h-12 mt-1 rounded-xl bg-[#7A0A17] text-white text-[14px] font-semibold tracking-wide hover:bg-[#640712] active:bg-[#54060F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-7">
            <span className="h-px w-10 bg-[#7A0A17]/20" />
            <p className="text-[11.5px] text-[#8a7f77]">Together, let&apos;s create beautiful matches</p>
            <span className="h-px w-10 bg-[#7A0A17]/20" />
          </div>
          <Heart size={12} className="text-[#7A0A17]/50 mx-auto mt-2" fill="currentColor" />
        </form>
      </div>
    </div>
  );
}
