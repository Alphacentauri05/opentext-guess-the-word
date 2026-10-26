import React, { useEffect } from "react";
import type { GuessItem, LetterColor } from "../types";
import { Delete } from "lucide-react";

interface KeyboardProps {
  onChar: (char: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  guesses: GuessItem[];
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export const Keyboard: React.FC<KeyboardProps> = ({
  onChar,
  onEnter,
  onDelete,
  guesses,
  disabled = false,
}) => {
  // Determine letter status based on past guesses: GREEN > ORANGE > GREY
  const letterStatuses: Record<string, LetterColor> = {};

  guesses.forEach((guess) => {
    const letters = guess.guess_word.split("");
    letters.forEach((letter, idx) => {
      const fb = guess.feedback[idx];
      const current = letterStatuses[letter];

      if (fb === "GREEN") {
        letterStatuses[letter] = "GREEN";
      } else if (fb === "ORANGE" && current !== "GREEN") {
        letterStatuses[letter] = "ORANGE";
      } else if (fb === "GREY" && !current) {
        letterStatuses[letter] = "GREY";
      }
    });
  });

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onChar(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChar, onEnter, onDelete, disabled]);

  const getKeyStyle = (key: string) => {
    const status = letterStatuses[key];
    if (status === "GREEN") {
      return "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm";
    }
    if (status === "ORANGE") {
      return "bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-sm";
    }
    if (status === "GREY") {
      return "bg-slate-800 text-slate-500 border-slate-700/60 opacity-60";
    }
    return "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95";
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-1.5 px-2 select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "BACKSPACE";

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  if (key === "ENTER") onEnter();
                  else if (key === "BACKSPACE") onDelete();
                  else onChar(key);
                }}
                className={`h-12 sm:h-14 font-bold text-sm sm:text-base rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                  isSpecial ? "px-3 sm:px-4 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600" : "flex-1 max-w-[44px]"
                } ${getKeyStyle(key)} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {key === "BACKSPACE" ? <Delete className="w-5 h-5" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
