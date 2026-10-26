import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { gamesApi } from "../api/client";
import type { DailyQuotaStatus } from "../types";
import {
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  History,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quota, setQuota] = useState<DailyQuotaStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = async () => {
    setLoading(true);
    try {
      const data = await gamesApi.getQuota();
      setQuota(data);
    } catch (err: any) {
      setError(err.message || "Failed to load quota status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const handleStartGame = () => {
    navigate("/game");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OpenText Wordle Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.username}</span>!
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Test your vocabulary against the OpenText dictionary. Guess the secret 5-letter word in 5 attempts with color-coded feedback.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleStartGame}
              disabled={loading || (!quota?.can_play && !quota?.active_game_id)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
            >
              {quota?.active_game_id ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin-slow" />
                  <span>Resume In-Progress Game</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start New Word</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>View History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Limit Status & Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Quota Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daily Allowance
              </span>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Today: {quota?.date || "UTC"}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">
                {quota?.daily_games_played ?? 0}
              </span>
              <span className="text-lg text-slate-400 font-medium">
                / {quota?.daily_limit ?? 3} words played
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              {quota?.daily_games_remaining ?? 0} {quota?.daily_games_remaining === 1 ? "word" : "words"} remaining today. Resets daily at midnight.
            </p>
          </div>

          <div className="mt-6">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((quota?.daily_games_played ?? 0) / (quota?.daily_limit ?? 3)) * 100}%`,
                }}
              ></div>
            </div>

            {quota?.daily_games_remaining === 0 && !quota?.active_game_id && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>You have used all 3 words for today. Come back tomorrow!</span>
              </div>
            )}
          </div>
        </div>

        {/* How to Play Card */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Rules of Guess the Word
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Green Rule */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center mb-2 shadow-sm">
                W
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Green
              </span>
              <p className="text-xs text-slate-300">
                Correct letter in the exact correct position.
              </p>
            </div>

            {/* Orange Rule */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white font-extrabold text-lg flex items-center justify-center mb-2 shadow-sm">
                O
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Orange
              </span>
              <p className="text-xs text-slate-300">
                Correct letter, but placed in the wrong position.
              </p>
            </div>

            {/* Grey Rule */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-700 text-slate-300 font-extrabold text-lg flex items-center justify-center mb-2 shadow-sm">
                R
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Grey
              </span>
              <p className="text-xs text-slate-300">
                The letter is not in the secret word at all.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>• Maximum 5 guesses per word</span>
            <span>• Maximum 3 words per day</span>
            <span>• Uppercase 5-letter English words</span>
          </div>
        </div>
      </div>
    </div>
  );
};
