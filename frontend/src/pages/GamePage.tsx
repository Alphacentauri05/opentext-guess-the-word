import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gamesApi } from "../api/client";
import type { GameDetail } from "../types";
import { WordGrid } from "../components/WordGrid";
import { Keyboard } from "../components/Keyboard";
import { GameResultModal } from "../components/GameResultModal";
import { ArrowLeft, AlertCircle, Sparkles, Hash } from "lucide-react";

export const GamePage: React.FC = () => {
  const navigate = useNavigate();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initGame = async () => {
    setLoading(true);
    setError(null);
    try {
      // Start or resume game
      const gameData = await gamesApi.start();
      setGame(gameData);
    } catch (err: any) {
      setError(err.message || "Failed to initialize game.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleChar = useCallback(
    (char: string) => {
      if (!game || game.status !== "IN_PROGRESS" || submitting) return;
      if (currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + char.toUpperCase());
        setError(null);
      }
    },
    [game, currentGuess, submitting]
  );

  const handleDelete = useCallback(() => {
    if (!game || game.status !== "IN_PROGRESS" || submitting) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setError(null);
  }, [game, submitting]);

  const handleEnter = useCallback(async () => {
    if (!game || game.status !== "IN_PROGRESS" || submitting) return;

    if (currentGuess.length !== 5) {
      setError("Guess must be exactly 5 letters long.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await gamesApi.submitGuess(game.id, currentGuess);
      setGame(updated);
      setCurrentGuess("");
    } catch (err: any) {
      setError(err.message || "Invalid guess submission.");
    } finally {
      setSubmitting(false);
    }
  }, [game, currentGuess, submitting]);

  const handleFinishGame = () => {
    navigate("/dashboard");
  };

  const handlePlayNext = () => {
    setCurrentGuess("");
    initGame();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Preparing game session...</p>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Unable to Start Game</h3>
        <p className="text-slate-300 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isGameOver = game?.status === "WON" || game?.status === "LOST";
  const canPlayMore = (game?.daily_games_remaining ?? 0) > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-between min-h-[calc(100vh-5rem)]">
      {/* Game Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-300">
            <Hash className="w-3.5 h-3.5 text-blue-400" />
            <span>Attempt: {game?.attempts_used ?? 0} / 5</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Daily: {game?.daily_games_played ?? 0} / 3</span>
          </div>
        </div>
      </div>

      {/* Error / Feedback notification */}
      <div className="h-8 flex items-center justify-center">
        {error && (
          <div className="px-4 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 5x5 Letter Grid */}
      <div className="my-auto py-2">
        <WordGrid
          guesses={game?.guesses ?? []}
          currentGuess={currentGuess}
          maxAttempts={5}
          wordLength={5}
        />
      </div>

      {/* On-Screen Keyboard */}
      <div className="w-full pt-4 pb-2">
        <Keyboard
          onChar={handleChar}
          onEnter={handleEnter}
          onDelete={handleDelete}
          guesses={game?.guesses ?? []}
          disabled={isGameOver || submitting}
        />
      </div>

      {/* Result Modal */}
      {isGameOver && game && (
        <GameResultModal
          status={game.status}
          attemptsUsed={game.attempts_used}
          secretWord={game.secret_word}
          onOk={handleFinishGame}
          canPlayMore={canPlayMore}
          onPlayAgain={canPlayMore ? handlePlayNext : undefined}
        />
      )}
    </div>
  );
};
