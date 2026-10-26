import React, { useState, useEffect } from "react";
import { adminApi } from "../api/client";
import type {
  DailyActivityReportItem,
  UserActivityReportItem,
  AdminSummaryStats,
} from "../types";
import {
  BarChart3,
  Users,
  Trophy,
  Activity,
  Calendar,
  RefreshCw,
  Search,
} from "lucide-react";

export const AdminPage: React.FC = () => {
  const [dailyReports, setDailyReports] = useState<DailyActivityReportItem[]>([]);
  const [userReports, setUserReports] = useState<UserActivityReportItem[]>([]);
  const [summary, setSummary] = useState<AdminSummaryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"daily" | "users">("daily");
  const [userFilter, setUserFilter] = useState<string>("");

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dailyData, userData, summaryData] = await Promise.all([
        adminApi.getDailyReport(),
        adminApi.getUserReport(),
        adminApi.getSummary(),
      ]);
      setDailyReports(dailyData);
      setUserReports(userData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || "Failed to load administrative reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredUserReports = userReports.filter((item) =>
    item.username.toLowerCase().includes(userFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Administrative Controls</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-400" />
            <span>OpenText Analytics & Reporting</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time daily usage logs and user performance statistics
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Players
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.total_players ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Registered users</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Games Played
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.total_games_played ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Total words attempted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Correct Guesses
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {summary?.total_games_won ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Successfully solved</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Win Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {summary?.overall_win_rate ?? 0}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Overall success rate</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6">
        <button
          onClick={() => setActiveTab("daily")}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === "daily"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Daily Activity Report
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === "users"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          User-Level Report
        </button>
      </div>

      {/* Tab 1: Daily Activity Report */}
      {activeTab === "daily" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 bg-slate-800/40 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">
              Daily Activity Summary (Specification 2.0)
            </h3>
            <span className="text-xs text-slate-400">
              Showing daily breakdown of active users and correct guesses
            </span>
          </div>

          {dailyReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No game activity recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Number of Users</th>
                    <th scope="col" className="px-6 py-4">Number of Correct Guesses</th>
                    <th scope="col" className="px-6 py-4">Total Words Played</th>
                    <th scope="col" className="px-6 py-4">Daily Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dailyReports.map((row) => {
                    const dailyRate =
                      row.total_games_played > 0
                        ? Math.round(
                            (row.number_of_correct_guesses /
                              row.total_games_played) *
                              100
                          )
                        : 0;

                    return (
                      <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white whitespace-nowrap flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>{row.date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-200">
                            {row.number_of_users}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-emerald-400">
                            {row.number_of_correct_guesses}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-300">
                            {row.total_games_played}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {dailyRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User-Level Activity Report */}
      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">
                User Performance Report (Specification 2.0)
              </h3>
              <span className="text-xs text-slate-400">
                Detailed record: date, number of words tried, and number of correct guesses
              </span>
            </div>

            {/* Filter by username */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by username..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {filteredUserReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No user activity found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Username</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Number of Words Tried</th>
                    <th scope="col" className="px-6 py-4">Number of Correct Guesses</th>
                    <th scope="col" className="px-6 py-4">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUserReports.map((row, idx) => {
                    const accuracy =
                      row.words_tried > 0
                        ? Math.round(
                            (row.number_of_correct_guesses /
                              row.words_tried) *
                              100
                          )
                        : 0;

                    return (
                      <tr key={`${row.user_id}-${row.date}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                          {row.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                          {row.words_tried}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-400">
                          {row.number_of_correct_guesses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              accuracy >= 50
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
