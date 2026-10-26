import React from "react";
import { Trophy, Frown, ArrowRight, RotateCcw } from "lucide-react";
import type { GameStatus } from "../types";

interface GameResultModalProps {
  status: GameStatus;
  attemptsUsed: number;
  secretWord?: string | null;
  onOk: () => void;
  canPlayMore: boolean;
  onPlayAgain?: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  status,
  attemptsUsed,
  secretWord,
  onOk,
  canPlayMore,
  onPlayAgain,
}) => {
  if (status !== "WON" && status !== "LOST") return null;

  const isWon = status === "WON";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            isWon
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {isWon ? (
            <Trophy className="w-9 h-9 animate-bounce" />
          ) : (
            <Frown className="w-9 h-9" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {isWon ? "Congratulations!" : "Better luck next time!"}
        </h2>

        {/* Message */}
        <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          {isWon
            ? `Fantastic work! You correctly guessed the word in ${attemptsUsed} ${
                attemptsUsed === 1 ? "attempt" : "attempts"
              }.`
            : "You have used all 5 attempts without finding the secret word."}
        </p>

        {/* Secret Word Reveal */}
        {secretWord && (
          <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-6">
            <span className="text-xs uppercase text-slate-400 tracking-wider font-semibold block mb-1">
              The secret word was
            </span>
            <span className="text-2xl font-black text-emerald-400 tracking-widest uppercase">
              {secretWord}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {canPlayMore && onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Word</span>
            </button>
          )}

          <button
            onClick={onOk}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              canPlayMore && onPlayAgain
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25"
            }`}
          >
            <span>OK (Finish Game)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
