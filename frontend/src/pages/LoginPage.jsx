import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLoginBg from "../assets/mml-login-background1.png";
import leftLogo from "../assets/MML_Logo.png";
import loginFormLogo from "../assets/form-logo.png";
import { DUMMY_CREDENTIALS, isAuthenticated, login as loginUser } from "../utils/auth";

// Artwork is 6164x3112 (~1.98:1). We still cover the viewport so the
// login card overlay does not move, but we only apply part of the
// left/right stretch so baked-in logos and circular icons look closer
// to their real proportions (a little remaining stretch keeps edges filled).

// The card/form was designed against a 1440px-wide frame; we scale the
// whole overlay uniformly to match however large the frame actually renders.
const BASE_WIDTH = 1440;
// Figma: card is ~19.2% of the frame (~277px at 1440) and sits in the
// middle of the right-hand photo, not stretched across it.
const CARD_WIDTH = 280;
// Approx. unscaled card height — used so width-based scaling never
// stretches the form taller than the viewport (Figma floating card).
const CARD_HEIGHT = 520;

const ART_WIDTH = 6164;
const ART_HEIGHT = 3112;
const ART_ASPECT = ART_WIDTH / ART_HEIGHT;
// 0 = old full stretch (object-fit: fill), 1 = no stretch (cover).
const STRETCH_EASE = 0.45;

function LoginForm({
  username,
  password,
  showPassword,
  submitting,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onForgotPassword,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div
        className="rounded-[24px] px-7 pt-3 pb-5"
        style={{ background: "#FDF3EB", boxShadow: "0 14px 40px rgba(0,0,0,0.18)" }}
      >
        <div className="flex flex-col items-center text-center mb-1.5">
          <img
            src={loginFormLogo}
            alt="Make My Lagan Matrimonials"
            className="w-[176px] h-auto select-none"
            draggable={false}
          />
        </div>

        <div className="flex flex-col" style={{ gap: "0.5rem" }}>
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={onUsernameChange}
            leftIcon={<UserRound size={16} />}
            wrapperClassName="gap-1"
            labelClassName="text-[12px] font-medium text-[#8a7f77]"
            className="bg-white border-black/12 shadow-sm rounded-xl"
            style={{ height: "40px", fontSize: "13px" }}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={onPasswordChange}
            leftIcon={<Lock size={16} />}
            wrapperClassName="gap-1"
            labelClassName="text-[12px] font-medium text-[#8a7f77]"
            className="bg-white border-black/12 shadow-sm rounded-xl"
            style={{ height: "40px", fontSize: "13px" }}
            rightIcon={
              <button
                type="button"
                onClick={onTogglePassword}
                className="pointer-events-auto text-[#8f95a5] hover:text-[#3A3230] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="flex justify-end -mt-0.5">
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-medium text-[#68101E] hover:underline underline-offset-2"
              style={{ fontSize: "12px" }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#68101E] text-white font-semibold tracking-[0.14em] shadow-[0_8px_20px_rgba(104,16,30,0.35)] hover:bg-[#520d18] active:bg-[#430b14] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            style={{ height: "40px", fontSize: "13px" }}
          >
            {submitting ? "Signing in…" : "SIGN IN"}
          </button>

          <div className="flex flex-col items-center gap-1.5 w-full">
            <p className="text-[#8a7f77] text-center" style={{ fontSize: "11px" }}>
              Together, let&apos;s create beautiful matches
            </p>
            <div className="flex items-center justify-center gap-3 w-full">
              <span className="h-px flex-1 bg-[#68101E]/25" />
              <Heart size={12} className="text-[#68101E] shrink-0" fill="currentColor" />
              <span className="h-px flex-1 bg-[#68101E]/25" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Overlay positions stay viewport percentages (layout unchanged).
  // The photo is sized between a full stretch and a uniform cover.
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Already signed in (e.g. a page refresh) — skip straight to the dashboard.
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const scale =
    viewport.width && viewport.height
      ? Math.min(viewport.width / BASE_WIDTH, (viewport.height * 0.76) / CARD_HEIGHT)
      : 1;
  const pointAt = (leftPct, topPct) => ({
    left: (parseFloat(leftPct) / 100) * viewport.width,
    top: (parseFloat(topPct) / 100) * viewport.height,
  });

  const bgStyle = (() => {
    const { width: vw, height: vh } = viewport;
    if (!vw || !vh) {
      return { inset: 0, width: "100%", height: "100%", objectFit: "fill" };
    }
    const viewAspect = vw / vh;
    let coverW;
    if (viewAspect > ART_ASPECT) {
      coverW = vw;
    } else {
      coverW = vh * ART_ASPECT;
    }
    const w = vw + (coverW - vw) * STRETCH_EASE;
    return {
      width: w,
      height: vh,
      left: (vw - w) / 2,
      top: 0,
      objectFit: "fill",
    };
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter your username and password.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const isValid =
        username.trim().toLowerCase() === DUMMY_CREDENTIALS.username &&
        password === DUMMY_CREDENTIALS.password;

      if (!isValid) {
        toast.error("Invalid username or password. Please try again.");
        return;
      }

      loginUser();
      toast.success("Welcome back!");
      navigate("/dashboard");
    }, 700);
  };

  const formProps = {
    username,
    password,
    showPassword,
    submitting,
    onUsernameChange: (e) => setUsername(e.target.value),
    onPasswordChange: (e) => setPassword(e.target.value),
    onTogglePassword: () => setShowPassword((v) => !v),
    onForgotPassword: () => toast.info("Please contact your admin to reset your password."),
    onSubmit: handleSubmit,
  };

  return (
    <>
      {/* Small screens: form only, no split artwork */}
      <div className="md:hidden min-h-screen flex items-center justify-center bg-[#F6EDE4] px-5 py-8">
        <div className="w-full max-w-[360px]">
          <LoginForm {...formProps} />
        </div>
      </div>

      {/* Desktop / large screens: full artwork + overlaid form */}
      <div className="hidden md:block relative w-screen h-screen bg-[#2b1410] overflow-hidden">
        <img
          src={mmlLoginBg}
          alt="Make My Lagan Matrimonials"
          className="absolute max-w-none select-none"
          style={bgStyle}
          draggable={false}
        />

        <img
          src={leftLogo}
          alt="Make My Lagan Matrimonials"
          className="absolute select-none pointer-events-none"
          style={{
            ...pointAt("25.3%", "12%"),
            width: `${Math.round((viewport.height || 900) * 0.27)}px`,
            height: "auto",
            transform: "translate(-50%, -50%)",
          }}
          draggable={false}
        />

        <div
          className="absolute"
          style={{
            ...pointAt("76%", "51%"),
            width: `${CARD_WIDTH}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <LoginForm {...formProps} />
        </div>
      </div>
    </>
  );
}
