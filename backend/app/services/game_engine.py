from collections import Counter
from enum import Enum
from typing import List, Tuple


class LetterFeedback(str, Enum):
    GREEN = "GREEN"  # Correct letter in correct position
    ORANGE = "ORANGE"  # Correct letter in wrong position
    GREY = "GREY"  # Letter not in word


class GameStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    WON = "WON"
    LOST = "LOST"


class GameEngine:
    """Core Wordle evaluation engine implementing OpenText specifications:
    - 5-letter uppercase words
    - Max 5 guesses
    - Precise 2-pass feedback (GREEN, ORANGE, GREY)
    - Accurate duplicate/repeated letter counting
    """

    WORD_LENGTH = 5
    MAX_ATTEMPTS = 5

    @classmethod
    def sanitize_and_validate_word(cls, word: str) -> str:
        """Validate that a word is exactly 5 letters and contains only alphabetic characters."""
        if not word or not isinstance(word, str):
            raise ValueError("Word must be a non-empty string.")

        cleaned = word.strip().upper()
        if len(cleaned) != cls.WORD_LENGTH:
            raise ValueError(
                f"Word must be exactly {cls.WORD_LENGTH} letters long."
            )
        if not cleaned.isalpha():
            raise ValueError("Word must contain only alphabetic letters (A-Z).")
        return cleaned

    @classmethod
    def evaluate_guess(
        cls,
        secret_word: str,
        guess_word: str,
        attempts_used: int,
        max_attempts: int = MAX_ATTEMPTS,
    ) -> Tuple[List[str], GameStatus]:
        """Perform two-pass evaluation of a guess against a secret word.

        Returns:
            feedback: List[str] with elements 'GREEN', 'ORANGE', or 'GREY'
            status: GameStatus ('WON', 'LOST', or 'IN_PROGRESS')
        """
        secret = cls.sanitize_and_validate_word(secret_word)
        guess = cls.sanitize_and_validate_word(guess_word)

        feedback: List[str] = [None] * cls.WORD_LENGTH  # type: ignore

        # Count frequencies of letters in secret word
        secret_counts = Counter(secret)

        # PASS 1: Identify all exact matches (GREEN)
        for i in range(cls.WORD_LENGTH):
            if guess[i] == secret[i]:
                feedback[i] = LetterFeedback.GREEN.value
                secret_counts[guess[i]] -= 1

        # PASS 2: Identify misplaced letters (ORANGE) and absent letters (GREY)
        for i in range(cls.WORD_LENGTH):
            if feedback[i] is None:
                char = guess[i]
                if secret_counts.get(char, 0) > 0:
                    feedback[i] = LetterFeedback.ORANGE.value
                    secret_counts[char] -= 1
                else:
                    feedback[i] = LetterFeedback.GREY.value

        # Determine Game Status
        all_green = all(f == LetterFeedback.GREEN.value for f in feedback)
        if all_green:
            return feedback, GameStatus.WON
        elif attempts_used >= max_attempts:
            return feedback, GameStatus.LOST
        else:
            return feedback, GameStatus.IN_PROGRESS
