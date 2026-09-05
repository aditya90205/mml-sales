import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import mmlLoginBg from "../assets/mml-login-page.png";

// Percentages are measured against the 5760x3112 mml-login-page.png artwork
// so overlaid content lands exactly on the blank slots baked into the image.
const STAT_VALUES = ["17+", "1000+", "4+", ""];
const STAT_X = [5.6, 16.7, 27.8, 38.9]; // column centers, % of image width
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
    <div className="relative h-[100vh] w-full flex items-center justify-center bg-[#1a0a08] overflow-hidden">
      <div className="relative h-full aspect-[5760/3112] max-w-full">
        <img
          src={mmlLoginBg}
          alt="Make My Lagan Matrimonials"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

        {/* ── Stat numbers baked-blank in the maroon bar ── */}
        {STAT_VALUES.map((value, i) => (
          <div
            key={value}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-bold text-white leading-none whitespace-nowrap"
            style={{ left: `${STAT_X[i]}%`, top: `${STAT_Y}%`, fontSize: "clamp(11px, 1.9vh, 22px)" }}
          >
            {value}
          </div>
        ))}

        {/* ── Sign-in form, overlaid on the blank card area ── */}
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
          <div className="flex flex-col" style={{ gap: "1.6vh" }}>
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserRound size={16} />}
              wrapperClassName="gap-1"
              className="bg-white"
              style={{ height: "4.2vh", fontSize: "clamp(10px, 1.3vh, 15px)" }}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              wrapperClassName="gap-1"
              className="bg-white"
              style={{ height: "4.2vh", fontSize: "clamp(10px, 1.3vh, 15px)" }}
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

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => toast.info("Please contact your admin to reset your password.")}
                className="font-medium text-[#68101E] hover:underline underline-offset-2"
                style={{ fontSize: "clamp(9px, 1.15vh, 13px)" }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ gap: "1.4vh" }}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#68101E] text-white font-semibold tracking-[0.12em] hover:bg-[#520d18] active:bg-[#430b14] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{ height: "5vh", fontSize: "clamp(10px, 1.4vh, 16px)" }}
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>

            <div className="text-center">
              <p className="text-[#8a7f77]" style={{ fontSize: "clamp(8px, 1.05vh, 12px)" }}>
                Together, let&apos;s create beautiful matches
              </p>
              <Heart size={12} className="text-[#68101E] mx-auto mt-1" fill="currentColor" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
