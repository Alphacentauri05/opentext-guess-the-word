import React from "react";
import type { GuessItem, LetterColor } from "../types";

interface WordGridProps {
  guesses: GuessItem[];
  currentGuess: string;
  maxAttempts?: number;
  wordLength?: number;
}

export const WordGrid: React.FC<WordGridProps> = ({
  guesses,
  currentGuess,
  maxAttempts = 5,
  wordLength = 5,
}) => {
  const rows = Array.from({ length: maxAttempts });

  const getTileStyles = (color?: LetterColor) => {
    switch (color) {
      case "GREEN":
        return "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/30";
      case "ORANGE":
        return "bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-900/30";
      case "GREY":
        return "bg-slate-700 border-slate-600 text-slate-300";
      default:
        return "bg-slate-900/60 border-slate-700/80 text-white";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none py-2">
      {rows.map((_, rowIndex) => {
        const isPastRow = rowIndex < guesses.length;
        const isCurrentRow = rowIndex === guesses.length;

        let letters: string[] = Array(wordLength).fill("");
        let feedbacks: (LetterColor | undefined)[] = Array(wordLength).fill(undefined);

        if (isPastRow) {
          const guess = guesses[rowIndex];
          letters = guess.guess_word.split("");
          feedbacks = guess.feedback;
        } else if (isCurrentRow) {
          letters = currentGuess
            .padEnd(wordLength, " ")
            .split("")
            .slice(0, wordLength);
        }

        return (
          <div key={rowIndex} className="flex gap-2">
            {letters.map((char, colIndex) => {
              const displayChar = char.trim().toUpperCase();
              const feedback = feedbacks[colIndex];
              const hasLetter = isCurrentRow && displayChar.length > 0;

              return (
                <div
                  key={colIndex}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center font-extrabold text-2xl sm:text-3xl rounded-xl border-2 transition-all duration-200 ${
                    isPastRow
                      ? `${getTileStyles(feedback)} tile-flip`
                      : hasLetter
                      ? "border-indigo-400 bg-slate-800/90 text-white tile-pop shadow-sm"
                      : "border-slate-800 bg-slate-900/40 text-slate-500"
                  }`}
                >
                  {displayChar}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
