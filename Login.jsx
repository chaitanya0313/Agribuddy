import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Step 1: phone + password | Step 2: OTP
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState(""); // success hint
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── STEP 1: Verify phone + password ──────────────────
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Please enter phone number and password");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmers/login/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setMessage(data.message); // e.g. "OTP sent to ch****@gmail.com"
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ──────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmers/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      // Save farmer info to localStorage
      localStorage.setItem("farmerId", data.farmerId);
      localStorage.setItem("farmerName", data.farmerName);
      // Also save with agri_ prefix used by CropSeasonContext
      localStorage.setItem("agri_farmer_id", data.farmerId);
      localStorage.setItem("agri_farmer_name", data.farmerName);
      // Save token if returned
      if (data.token) {
        localStorage.setItem("agri_token", data.token);
      }

      alert(`✅ Welcome, ${data.farmerName}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">AgriFinTech</h1>
          <p className="text-gray-500 text-sm">Smart farming, better profits</p>
        </div>

        <h2 className="text-xl font-semibold text-center text-green-700">Welcome back!</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {step === 1 ? "Sign in with your phone number" : "Enter the OTP sent to your email"}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-green-600" : "bg-gray-200"}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-green-600" : "bg-gray-200"}`} />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* ── STEP 1 FORM ── */}
        {step === 1 && (
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Send OTP →"}
            </button>
          </form>
        )}

        {/* ── STEP 2 FORM ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}

              maxLength={6}
              className="w-full p-3 border rounded-lg text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-60"
            >
              {loading ? "Verifying OTP..." : "Verify & Login ✓"}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); setError(""); setMessage(""); }}
              className="w-full text-sm text-gray-500 hover:text-green-700 mt-2"
            >
              ← Back / Resend OTP
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-700 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}