import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Lock,
  Eye,
  EyeOff,
  Heart,
  ShieldCheck,
  HeartHandshake,
  Headset,
  UserCheck,
  Users,
  UsersRound,
  MapPin,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLogo from "../assets/mml-logo.png";
import loginLeftImage from "../assets/login-left-image.png";
import loginInsideFormImage from "../assets/login-inside-form-image.png";
import loginFloral from "../assets/login-top-left.png";

const FEATURES = [
  { icon: UserCheck, label: "Verified\nProfiles" },
  { icon: ShieldCheck, label: "Secure &\nTrusted" },
  { icon: HeartHandshake, label: "Personalized\nMatchmaking" },
  { icon: Headset, label: "Dedicated\nSupport" },
];

const STATS = [
  { icon: Users, value: "17+", label: "Years of Experience" },
  { icon: UsersRound, value: "1000+", label: "Successful Matches" },
  { icon: MapPin, value: "4+", label: "Locations in India & Overseas" },
  { icon: Globe, value: "Global Reach", label: "Indian & NRI Families" },
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
    <div className="relative h-[100vh] w-full flex overflow-hidden bg-[#fcf4ec]">
      {/* ── Left: brand / info panel ── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[48%] h-full relative flex-col overflow-hidden bg-[#fcf4ec]">
        <img
          src={loginFloral}
          alt=""
          className="absolute -top-10 -left-16 w-[420px] xl:w-[480px] h-auto pointer-events-none select-none mix-blend-multiply opacity-90"
          aria-hidden
        />
        <img
          src={loginFloral}
          alt=""
          className="absolute -bottom-6 -left-20 w-[300px] xl:w-[340px] h-auto pointer-events-none select-none mix-blend-multiply opacity-70 scale-y-[-1] origin-bottom"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col flex-1 px-6 xl:px-10 pt-7 pb-0 min-h-0">
          <div className="flex justify-center shrink-0">
            <img
              src={mmlLogo}
              alt="Make My Lagan Matrimonials"
              className="h-[80px] xl:h-[88px] w-auto object-contain"
            />
          </div>

          <div className="text-center mt-4 shrink-0">
            <h1 className="font-display text-[24px] xl:text-[30px] leading-[1.25] text-[#68101E] font-semibold">
              Bringing Hearts Together,
              <br />
              Building Beautiful Futures.
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="h-px w-12 bg-[#68101E]/30" />
              <Heart size={13} className="text-[#68101E]" fill="currentColor" />
              <span className="h-px w-12 bg-[#68101E]/30" />
            </div>
          </div>

          <div className="flex items-start justify-center gap-8 xl:gap-12 mt-6 shrink-0 px-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2.5 w-[100px] px-1">
                <span className="size-[52px] xl:size-14 rounded-full bg-[#68101E] text-white grid place-items-center shadow-[0_6px_16px_rgba(104,16,30,0.22)]">
                  <f.icon size={22} strokeWidth={1.7} />
                </span>
                <p className="text-[12px] xl:text-[12.5px] font-semibold text-[#3A3230] text-center leading-snug whitespace-pre-line">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          <div className="relative flex-1 min-h-[200px] mt-2 mb-[-24px] z-[5]">
            <img
              src={loginLeftImage}
              alt=""
              className="absolute inset-0 w-full h-full object-contain object-center mix-blend-multiply pointer-events-none select-none"
              aria-hidden
            />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-4 h-[110px] shrink-0 bg-[#68101E]">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center justify-center gap-1.5 text-center px-3 xl:px-4 ${
                i === 0 ? "" : "border-l border-white/15"
              }`}
            >
              <s.icon size={16} className="text-white/90" strokeWidth={1.8} />
              <span className="text-[15px] xl:text-[17px] font-bold text-white leading-none">
                {s.value}
              </span>
              <span className="text-[10px] xl:text-[11px] text-white/80 leading-tight max-w-[118px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: sign-in panel (photo wraps around the stats-bar curve) ── */}
      <div className="relative z-0 flex-1 h-full flex items-center justify-center p-5 sm:p-8 lg:p-10 overflow-hidden lg:rounded-tl-[64px]">
        <img
          src={loginInsideFormImage}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 z-0 bg-[#1a0a08]/35" aria-hidden />

        {/* Maroon curve lives INSIDE the photo — desk shows in the rounded cutout */}
        <div
          className="hidden lg:block absolute bottom-0 left-0 z-[1] h-[110px] w-[110px] bg-[#68101E] rounded-tr-[110px]"
          aria-hidden
        />

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-[400px] bg-[#fcf4ec] rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.38)] px-7 py-8 sm:px-9 sm:py-9 flex flex-col"
        >
          <div className="flex justify-center mb-4">
            <img
              src={mmlLogo}
              alt="Make My Lagan Matrimonials"
              className="h-[72px] lg:h-[68px] w-auto object-contain"
            />
          </div>

          <div className="text-center">
            <h2 className="font-display text-[24px] sm:text-[26px] font-semibold text-[#68101E] leading-tight">
              Welcome Back, Team MML!
            </h2>
            <p className="text-[12.5px] text-[#6B6058] mt-2">
              Sign in to access your CRM dashboard.
            </p>
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
              className="h-11 bg-white"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              className="h-11 bg-white"
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
                className="text-[12.5px] font-medium text-[#68101E] hover:underline underline-offset-2"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="h-12 mt-2 w-[calc(100%-48px)] mx-auto rounded-xl bg-[#68101E] text-white text-[14px] font-semibold tracking-[0.12em] px-10 hover:bg-[#520d18] active:bg-[#430b14] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>
          </div>

          <div className="mt-7 text-center">
            <p className="text-[11.5px] text-[#8a7f77]">
              Together, let&apos;s create beautiful matches
            </p>
            <Heart size={14} className="text-[#68101E] mx-auto mt-2.5" fill="currentColor" />
          </div>
        </form>
      </div>

    </div>
  );
}
