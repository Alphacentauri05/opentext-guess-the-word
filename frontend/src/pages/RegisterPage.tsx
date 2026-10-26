import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../api/client";
import { UserPlus, User, KeyRound, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Username validation checks
  const usernameHasLength = username.length >= 5;
  const usernameHasLower = /[a-z]/.test(username);
  const usernameHasUpper = /[A-Z]/.test(username);
  const isUsernameValid = usernameHasLength && usernameHasLower && usernameHasUpper;

  // Password validation checks
  const passHasLength = password.length >= 5;
  const passHasAlpha = /[A-Za-z]/.test(password);
  const passHasNumber = /\d/.test(password);
  const passHasSpecial = /[$%*&#@!]/.test(password);
  const isPasswordValid = passHasLength && passHasAlpha && passHasNumber && passHasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameValid || !isPasswordValid) {
      setError("Please ensure all username and password requirements are met.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authApi.register({ username, password });
      login(response);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
          <span className="text-white font-black text-2xl tracking-wider">OT</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Create Player Account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Register to begin playing Guess the Word
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. PlayerOne"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Username requirements */}
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {usernameHasLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={usernameHasLength ? "text-emerald-400 font-medium" : "text-slate-400"}>
                    At least 5 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {usernameHasLower && usernameHasUpper ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={usernameHasLower && usernameHasUpper ? "text-emerald-400 font-medium" : "text-slate-400"}>
                    Both uppercase and lowercase letters
                  </span>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Password requirements */}
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {passHasLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={passHasLength ? "text-emerald-400 font-medium" : "text-slate-400"}>
                    At least 5 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passHasAlpha && passHasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={passHasAlpha && passHasNumber ? "text-emerald-400 font-medium" : "text-slate-400"}>
                    Contains both letters and numbers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passHasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={passHasSpecial ? "text-emerald-400 font-medium" : "text-slate-400"}>
                    Contains special character ($, %, *, &, #, @, !)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isUsernameValid || !isPasswordValid}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
