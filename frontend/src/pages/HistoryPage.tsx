import React, { useState, useEffect } from "react";
import { gamesApi } from "../api/client";
import type { GameHistoryItem } from "../types";
import { History, Trophy, Frown, Clock, Calendar } from "lucide-react";

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await gamesApi.getHistory();
        setHistory(data);
      } catch (err: any) {
        setError(err.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalGames = history.length;
  const gamesWon = history.filter((g) => g.is_won).length;
  const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-400" />
            <span>Personal Game History</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View your previously played words, attempts used, and outcomes
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Games:</span>
            <span className="text-base font-bold text-white">{totalGames}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Win Rate:</span>
            <span className="text-base font-bold text-emerald-400">{winRate}%</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-slate-400 text-sm">Loading history...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Games Played Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Start a game from the dashboard to test your skills and track your performance here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-700/60">
                <tr>
                  <th scope="col" className="px-6 py-4">Date & Time</th>
                  <th scope="col" className="px-6 py-4">Word Attempted</th>
                  <th scope="col" className="px-6 py-4">Attempts Used</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Correct Guess</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => {
                  const dateStr = new Date(item.started_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = new Date(item.started_at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-200 font-medium">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>{dateStr}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeStr}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-base tracking-widest text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {item.word_attempted}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-200">
                          {item.attempts_used} / {item.max_attempts}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === "WON" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>WON</span>
                          </span>
                        ) : item.status === "LOST" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Frown className="w-3.5 h-3.5" />
                            <span>LOST</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <span>IN PROGRESS</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-300">
                          {item.correct_guesses}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
