import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLoginBg from "../assets/mml-login-page.png";
import mmlLogo from "../assets/mml-logo.png";

// The artwork is 5760x3112. All positions below are percentages measured
// against that canvas so overlaid content lands on the blank slots baked
// into the image (Global Reach's number is already baked in, so it's
// skipped here).
const FORM_BOX = { top: 46, left: 64.2, width: 20, height: 34.5 }; // kept for legacy positioning

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
    <div className="relative w-screen h-screen bg-[#1a0a08] overflow-hidden">
      <img
        src={'/src/assets/mml-login-page-new.png'}
        alt="Make My Lagan Matrimonials"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = mmlLoginBg; }}
        className="absolute inset-0 w-full h-full object-cover select-none"
        style={{ objectPosition: 'left center' }}
        draggable={false}
      />

      {/* Overlayed form: centered vertically, positioned to the right on md+ screens */}
      <form
        onSubmit={handleSubmit}
        className="absolute top-1/2 -translate-y-1/2 w-full max-w-md p-4 z-20"
        style={{ right: '6vw', left: 'auto' }}
      >
        <div
          className="rounded-3xl p-8"
          style={{ background: "rgba(248, 241, 236, 0.96)", boxShadow: "0 14px 40px rgba(0,0,0,0.18)" }}
        >
          <div className="flex flex-col items-start mb-4">
            <img
              src={'/src/assets/login-form-logo.png'}
              alt="Login logo"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = mmlLogo; }}
              className="h-12 w-auto mb-2 select-none"
            />
            <h2 className="text-2xl font-semibold text-[#5d151b]">Welcome Back,</h2>
            <p className="text-xl font-bold text-[#5d151b] -mt-1">Team MML!</p>
            <p className="text-sm text-[#7a6d66] mt-1">Sign in to access your CRM dashboard.</p>
          </div>

          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserRound size={16} />}
              wrapperClassName="gap-1.5"
              className="bg-white border-black/12 shadow-sm rounded-xl"
              style={{ height: "48px", fontSize: "14px" }}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              wrapperClassName="gap-1.5"
              className="bg-white border-black/12 shadow-sm rounded-xl"
              style={{ height: "48px", fontSize: "14px" }}
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast.info("Please contact your admin to reset your password.")}
                className="font-medium text-[#68101E] hover:underline underline-offset-2"
                style={{ fontSize: "13px" }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#68101E] text-white font-semibold tracking-[0.14em] shadow-[0_8px_20px_rgba(104,16,30,0.35)] hover:bg-[#520d18] active:bg-[#430b14] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{ height: "52px", fontSize: "14px" }}
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>

            <div className="flex items-center justify-center gap-2.5 w-full mt-2">
              <span className="h-px flex-1 max-w-[20%] bg-[#68101E]/25" />
              <p className="text-[#8a7f77] whitespace-nowrap" style={{ fontSize: "12px" }}>
                Together, let&apos;s create beautiful matches
              </p>
              <span className="h-px flex-1 max-w-[20%] bg-[#68101E]/25" />
            </div>
            <Heart size={12} className="text-[#68101E] mt-1" fill="currentColor" />
          </div>
        </div>
      </form>
    </div>
  );
}
