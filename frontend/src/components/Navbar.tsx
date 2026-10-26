import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Gamepad2,
  History,
  BarChart3,
  LogOut,
  UserCheck,
  Shield,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl tracking-wider">OT</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight block leading-tight">
                Guess The Word
              </span>
              <span className="text-xs text-blue-400 font-medium tracking-wide uppercase">
                OpenText Edition
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/game"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/game")
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Play</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/history")
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>My History</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Admin Reports</span>
              </Link>
            )}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              {isAdmin ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm font-medium text-slate-200">
                {user?.username}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${
                  isAdmin
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
