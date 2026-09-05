import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLoginBg from "../assets/mml-login-page.png";

// The artwork is 5760x3112. All positions below are percentages measured
// against that canvas so overlaid content lands on the blank slots baked
// into the image (Global Reach's number is already baked in, so it's
// skipped here).
const IMAGE_RATIO = 5760 / 3112;
const STATS = [
  { value: "17+", x: 5.6 },
  { value: "1000+", x: 16.7 },
  { value: "4+", x: 27.8 },
];
const STAT_Y = 93.2; // row center, % of image height

const FORM_BOX = { top: 46, left: 64.2, width: 20, height: 34.5 }; // % of image

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a0a08]">
      {/* Sized to always cover the viewport (same math as object-fit: cover),
          so every child positioned by % lines up with the artwork exactly. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100vw, calc(100vh * ${IMAGE_RATIO}))`,
          height: `max(100vh, calc(100vw / ${IMAGE_RATIO}))`,
        }}
      >
        <img
          src={mmlLoginBg}
          alt="Make My Lagan Matrimonials"
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
          draggable={false}
        />

        {/* ── Stat numbers, overlaid on the blank slots in the maroon bar ── */}
        {STATS.map((s) => (
          <div
            key={s.value}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-bold text-white leading-none whitespace-nowrap drop-shadow-sm"
            style={{ left: `${s.x}%`, top: `${STAT_Y}%`, fontSize: "clamp(12px, 1.9vh, 24px)" }}
          >
            {s.value}
          </div>
        ))}

        {/* ── Sign-in form, overlaid on the blank card ── */}
        <form
          onSubmit={handleSubmit}
          className="absolute flex flex-col justify-between"
          style={{
            top: `${FORM_BOX.top}%`,
            left: `${FORM_BOX.left}%`,
            width: `${FORM_BOX.width}%`,
            height: `${FORM_BOX.height}%`,
          }}
        >
          <div className="flex flex-col" style={{ gap: "1.5vh" }}>
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
              style={{ height: "4.6vh", fontSize: "clamp(11px, 1.35vh, 15px)" }}
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
              style={{ height: "4.6vh", fontSize: "clamp(11px, 1.35vh, 15px)" }}
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
                style={{ fontSize: "clamp(10px, 1.15vh, 13px)" }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ gap: "1.6vh" }}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#68101E] text-white font-semibold tracking-[0.14em] shadow-[0_8px_20px_rgba(104,16,30,0.35)] hover:bg-[#520d18] active:bg-[#430b14] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{ height: "5.4vh", fontSize: "clamp(11px, 1.4vh, 16px)" }}
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>

            <div className="flex items-center justify-center gap-2.5 w-full">
              <span className="h-px flex-1 max-w-[15%] bg-[#68101E]/25" />
              <p className="text-[#8a7f77] whitespace-nowrap" style={{ fontSize: "clamp(9px, 1.05vh, 12px)" }}>
                Together, let&apos;s create beautiful matches
              </p>
              <span className="h-px flex-1 max-w-[15%] bg-[#68101E]/25" />
            </div>
            <Heart size={12} className="text-[#68101E] -mt-1" fill="currentColor" />
          </div>
        </form>
      </div>
    </div>
  );
}
