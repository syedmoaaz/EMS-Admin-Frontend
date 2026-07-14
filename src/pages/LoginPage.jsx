import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08143b]">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!userId.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await login(userId, password);

      if (!result.success) {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="lg:w-[45%] bg-[#08143b] text-white flex flex-col justify-between px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            MediTrack
          </h1>
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mt-2">
            EMS SUITE
          </p>
        </div>

        <div className="my-10 lg:my-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <ShieldCheck size={28} className="text-blue-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
            Employee Monitoring System
          </h2>

          <p className="text-slate-400 mt-4 max-w-md text-sm sm:text-base leading-relaxed">
            Secure admin access for monitoring attendance, branches, and field
            staff across NovaPharma Ltd.
          </p>
        </div>

        <p className="text-xs text-slate-500 hidden sm:block">
          © {new Date().getFullYear()} NovaPharma Ltd. All rights reserved.
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-100 px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">MediTrack</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">
              EMS Admin Login
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Sign in with your admin credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="userId"
                    type="email"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="owner@novapharma.com"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 transition shadow-sm"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Demo credentials
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <span className="font-medium">owner@novapharma.com</span> / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
