import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import logo from "../../assets/images/header.png";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === "otp" && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0].focus(), 100);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/send-otp", { email });
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);

    try {
      const data = await login(email, otpString);
      
      // If new account or profile not completed, go to profile page
      if (data.isNewUser || !data.user.profileCompleted) {
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex min-h-screen bg-[#ccf2ed]">
      {/* Left Section */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-[#ccf2ed]">
        <img src={logo} alt="Dr.32 Teeth" className="w-48 mb-4 border rounded-2xl shadow-sm" />
        <h2 className="text-2xl font-semibold text-gray-700 text-center">
          Your Smile, Our Priority
        </h2>
        <p className="text-gray-600 mt-2 text-center px-8">
          Enter your email to sign in or create an account. No passwords needed—just a quick OTP!
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center bg-white shadow-2xl rounded-l-3xl">
        <div className="w-full max-w-md p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-[#009688] mb-2">
            Welcome
          </h1>

          {step === "email" && (
            <p className="text-center text-gray-500 text-sm">
              Sign in or create a new account with your email.
            </p>
          )}

          {step === "otp" && (
            <p className="text-center text-gray-500 text-sm">
              We've sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
            </p>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#009688] transition"
                />
              </div>

              <button
                id="login-send-otp"
                type="submit"
                disabled={loading}
                className="w-full bg-[#009688] text-white py-3 rounded-md hover:bg-[#00796b] transition font-medium"
              >
                {loading ? "Sending..." : "Continue"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-3 font-medium text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                     <input
                      key={index}
                      id={`login-otp-${index}`}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-[#009688] transition"
                    />
                  ))}
                </div>
              </div>

              <button
                id="login-verify-otp"
                type="submit"
                disabled={loading}
                className="w-full bg-[#009688] text-white py-3 rounded-md hover:bg-[#00796b] transition font-medium"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:underline transition"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`transition ${
                    resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#009688] hover:underline"
                  }`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
