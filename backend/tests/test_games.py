import uuid
import pytest
from fastapi.testclient import TestClient


def register_and_get_token(client: TestClient, username: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={"username": username, "password": "Password*123"},
    )
    return res.json()["access_token"]


def test_start_game_and_hidden_word(client: TestClient):
    token = register_and_get_token(client, f"GameUser{uuid.uuid4().hex[:6]}")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/games/start", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "IN_PROGRESS"
    assert data["attempts_used"] == 0
    assert data["max_attempts"] == 5
    assert data["secret_word"] is None  # MUST remain hidden!
    assert data["daily_games_played"] == 1
    assert data["daily_games_remaining"] == 2


def test_resume_in_progress_game(client: TestClient):
    token = register_and_get_token(client, f"ResumeUser{uuid.uuid4().hex[:6]}")
    headers = {"Authorization": f"Bearer {token}"}

    # Start first time
    res1 = client.post("/api/v1/games/start", headers=headers)
    game_id_1 = res1.json()["id"]

    # Start again while still in progress
    res2 = client.post("/api/v1/games/start", headers=headers)
    game_id_2 = res2.json()["id"]

    # Must return the SAME game without burning additional daily allowance!
    assert game_id_1 == game_id_2
    assert res2.json()["daily_games_played"] == 1


def test_submit_guess_feedback(client: TestClient):
    token = register_and_get_token(client, f"GuessUser{uuid.uuid4().hex[:6]}")
    headers = {"Authorization": f"Bearer {token}"}

    start_res = client.post("/api/v1/games/start", headers=headers)
    game_id = start_res.json()["id"]

    # Submit a guess
    guess_res = client.post(
        f"/api/v1/games/{game_id}/guess",
        json={"guess": "AUDIO"},
        headers=headers,
    )
    assert guess_res.status_code == 200
    data = guess_res.json()
    assert data["attempts_used"] == 1
    assert len(data["guesses"]) == 1
    guess_entry = data["guesses"][0]
    assert guess_entry["guess_word"] == "AUDIO"
    assert len(guess_entry["feedback"]) == 5
    for color in guess_entry["feedback"]:
        assert color in ["GREEN", "ORANGE", "GREY"]


def test_daily_game_limit_enforcement(client: TestClient):
    """A player is allowed maximum 3 words per day. The 4th game must be rejected with HTTP 400."""
    token = register_and_get_token(client, f"LimitUser{uuid.uuid4().hex[:6]}")
    headers = {"Authorization": f"Bearer {token}"}

    # Play and complete 3 games (exhausting attempts on each)
    for game_num in range(1, 4):
        start_res = client.post("/api/v1/games/start", headers=headers)
        assert start_res.status_code == 200
        game_id = start_res.json()["id"]

        # Make 5 guesses to finish the game as LOST (using a known miss like 'ZZZZZ' or 'AUDIO')
        for i in range(5):
            client.post(
                f"/api/v1/games/{game_id}/guess",
                json={"guess": "ZZZZZ"},
                headers=headers,
            )

    # 4th game attempt must be rejected
    fourth_res = client.post("/api/v1/games/start", headers=headers)
    assert fourth_res.status_code == 400
    assert "daily limit" in fourth_res.json()["detail"].lower()


def test_game_history(client: TestClient):
    token = register_and_get_token(client, f"HistUser{uuid.uuid4().hex[:6]}")
    headers = {"Authorization": f"Bearer {token}"}

    # Start and make a guess
    start_res = client.post("/api/v1/games/start", headers=headers)
    game_id = start_res.json()["id"]
    client.post(
        f"/api/v1/games/{game_id}/guess",
        json={"guess": "ALERT"},
        headers=headers,
    )

    # Fetch history
    hist_res = client.get("/api/v1/games/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    item = history[0]
    assert item["id"] == game_id
    assert item["attempts_used"] == 1
    assert "word_attempted" in item
