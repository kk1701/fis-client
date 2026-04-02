import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../api/axios";

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // auto focus next
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });
      navigate("/reset-password", {
        state: { email, resetToken: res.data.resetToken },
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Invalid session.</p>
          <Link
            to="/forgot-password"
            className="text-primary text-sm hover:underline mt-2 block"
          >
            Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit code to
          </p>
          <p className="text-gray-800 text-sm font-medium">{email}</p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition ${
                digit
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-gray-200 text-gray-900"
              }`}
            />
          ))}
        </div>

        {/* timer */}
        <div className="text-center mb-4">
          {timeLeft > 0 ? (
            <p className="text-xs text-gray-400">
              OTP expires in{" "}
              <span
                className={`font-semibold ${timeLeft < 60 ? "text-red-500" : "text-gray-600"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-xs text-red-500">
              OTP expired.{" "}
              <Link
                to="/forgot-password"
                state={{ email }}
                className="hover:underline font-medium"
              >
                Request a new one
              </Link>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || timeLeft === 0 || otp.join("").length < 6}
          className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            to="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}
