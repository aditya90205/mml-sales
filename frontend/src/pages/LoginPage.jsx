import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLoginBg from "../assets/mml-login-page-new.png";
import loginFormLogo from "../assets/login-form-logo.png";

// The artwork is 5760x3112. The background always fills the full viewport
// height exactly, so the logo at the top and the stats bar at the bottom
// are always fully visible and never cropped — only the width stretches
// (or compresses) to fill the screen. All overlay positions below are
// percentages measured against the viewport itself.

// The card/form was designed against a 1440px-wide frame; we scale the
// whole overlay uniformly to match however large the frame actually renders.
const BASE_WIDTH = 1440;
const CARD_WIDTH = 448; // px, at BASE_WIDTH

// Positions of the blank number slots baked into the stats bar (the
// "Global Reach" label already has its number-slot filled in the artwork,
// so only the first three columns need an overlay).
const STATS = [
  { value: "17+", left: "5.7%" },
  { value: "1000+", left: "17.2%" },
  { value: "4+", left: "28.2%" },
];
const STATS_TOP = "91.6%";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The image fills the viewport exactly: height always matches 100vh (so
  // top/bottom content is never cropped or shifted) and width always
  // matches 100vw (stretching only left/right as needed). No offsets, so
  // overlay positions map directly to percentages of the viewport.
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const scale = viewport.width / BASE_WIDTH;
  const pointAt = (leftPct, topPct) => ({
    left: (parseFloat(leftPct) / 100) * viewport.width,
    top: (parseFloat(topPct) / 100) * viewport.height,
  });

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
    <div className="relative w-screen h-screen bg-[#2b1410] overflow-hidden">
      <img
        src={mmlLoginBg}
        alt="Make My Lagan Matrimonials"
        className="absolute inset-0 w-full h-full select-none"
        style={{ objectFit: "fill" }}
        draggable={false}
      />

      {/* Stat numbers overlaid onto the blank slots baked into the artwork */}
      {STATS.map((stat) => (
        <div
          key={stat.value}
          className="absolute font-bold text-white leading-none"
          style={{
            ...pointAt(stat.left, STATS_TOP),
            transform: "translate(-50%, -50%)",
            fontSize: `${14 * scale}px`,
          }}
        >
          {stat.value}
        </div>
      ))}

      {/* Login card, uniformly scaled to match the background image */}
      <div
        className="absolute"
        style={{
          ...pointAt("72%", "46%"),
          width: `${CARD_WIDTH}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <form onSubmit={handleSubmit}>
            <div
              className="rounded-3xl p-8"
              style={{ background: "rgba(248, 241, 236, 0.96)", boxShadow: "0 14px 40px rgba(0,0,0,0.18)" }}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <img
                  src={loginFormLogo}
                  alt="Make My Lagan Matrimonials"
                  className="w-44 h-auto mb-3 select-none"
                  draggable={false}
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
                <div className="flex items-center justify-center gap-2.5 w-full">
                  <span className="h-px flex-1 max-w-[28%] bg-[#68101E]/25" />
                  <Heart size={12} className="text-[#68101E] shrink-0" fill="currentColor" />
                  <span className="h-px flex-1 max-w-[28%] bg-[#68101E]/25" />
                </div>
              </div>
            </div>
        </form>
      </div>
    </div>
  );
}
