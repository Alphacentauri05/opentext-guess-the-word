import pytest
from app.services.game_engine import GameEngine, LetterFeedback, GameStatus


def test_sanitize_and_validate_word():
    # Lowercase should be capitalized
    assert GameEngine.sanitize_and_validate_word("tower") == "TOWER"
    assert GameEngine.sanitize_and_validate_word(" Audio ") == "AUDIO"

    # Too short
    with pytest.raises(ValueError, match="exactly 5 letters"):
        GameEngine.sanitize_and_validate_word("CAT")

    # Too long
    with pytest.raises(ValueError, match="exactly 5 letters"):
        GameEngine.sanitize_and_validate_word("PLANET")

    # Non-alpha
    with pytest.raises(ValueError, match="alphabetic"):
        GameEngine.sanitize_and_validate_word("TO1ER")


def test_opentext_assignment_example():
    """Verify the exact sequence from the OpenText assignment screenshot:
    Secret word: TOWER
    Guesses:
      1. AUDIO -> [GREY, GREY, GREY, GREY, ORANGE]
      2. HOMER -> [GREY, GREEN, GREY, GREEN, GREEN]
      3. POKER -> [GREY, GREEN, GREY, GREEN, GREEN]
      4. TONER -> [GREEN, GREEN, GREY, GREEN, GREEN]
      5. TOWER -> [GREEN, GREEN, GREEN, GREEN, GREEN] (WON)
    """
    secret = "TOWER"

    # Guess 1: AUDIO
    fb1, status1 = GameEngine.evaluate_guess(secret, "AUDIO", attempts_used=1)
    assert fb1 == ["GREY", "GREY", "GREY", "GREY", "ORANGE"]
    assert status1 == GameStatus.IN_PROGRESS

    # Guess 2: HOMER
    fb2, status2 = GameEngine.evaluate_guess(secret, "HOMER", attempts_used=2)
    assert fb2 == ["GREY", "GREEN", "GREY", "GREEN", "GREEN"]
    assert status2 == GameStatus.IN_PROGRESS

    # Guess 3: POKER
    fb3, status3 = GameEngine.evaluate_guess(secret, "POKER", attempts_used=3)
    assert fb3 == ["GREY", "GREEN", "GREY", "GREEN", "GREEN"]
    assert status3 == GameStatus.IN_PROGRESS

    # Guess 4: TONER
    fb4, status4 = GameEngine.evaluate_guess(secret, "TONER", attempts_used=4)
    assert fb4 == ["GREEN", "GREEN", "GREY", "GREEN", "GREEN"]
    assert status4 == GameStatus.IN_PROGRESS

    # Guess 5: TOWER
    fb5, status5 = GameEngine.evaluate_guess(secret, "TOWER", attempts_used=5)
    assert fb5 == ["GREEN", "GREEN", "GREEN", "GREEN", "GREEN"]
    assert status5 == GameStatus.WON


def test_repeated_letters_handling():
    """Secret: EAGLE (two E's at pos 0 and pos 4)
    Guess: GEESE (three E's at pos 1, 2, 4)
    - pos 4 is exact match: E == E -> GREEN
    - pos 1 matches first available E in EAGLE -> ORANGE
    - pos 2 has no more available E's -> GREY
    - pos 0: G is at pos 3 in EAGLE -> ORANGE
    - pos 3: S not in EAGLE -> GREY
    """
    secret = "EAGLE"
    guess = "GEESE"
    fb, status = GameEngine.evaluate_guess(secret, guess, attempts_used=1)
    assert fb[4] == "GREEN"   # E in correct spot
    assert fb[1] == "ORANGE"  # Second E matches remaining E in EAGLE
    assert fb[2] == "GREY"    # Third E has no matching letter
    assert fb[0] == "ORANGE"  # G is in EAGLE (pos 2)
    assert fb[3] == "GREY"    # S is not in EAGLE


def test_loss_condition_on_fifth_attempt():
    secret = "TOWER"
    # 5th attempt incorrect -> LOST
    fb, status = GameEngine.evaluate_guess(secret, "TONER", attempts_used=5)
    assert status == GameStatus.LOST

    # 4th attempt incorrect -> IN_PROGRESS
    fb4, status4 = GameEngine.evaluate_guess(secret, "TONER", attempts_used=4)
    assert status4 == GameStatus.IN_PROGRESS


def test_immediate_win_on_first_guess():
    secret = "MAGIC"
    fb, status = GameEngine.evaluate_guess(secret, "MAGIC", attempts_used=1)
    assert fb == ["GREEN", "GREEN", "GREEN", "GREEN", "GREEN"]
    assert status == GameStatus.WON
