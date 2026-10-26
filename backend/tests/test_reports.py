import uuid
import pytest
from fastapi.testclient import TestClient
from scripts.create_admin import create_or_update_admin


def test_player_forbidden_from_admin_reports(client: TestClient):
    # Register as normal player
    player_username = f"Player{uuid.uuid4().hex[:6]}"
    res = client.post(
        "/api/v1/auth/register",
        json={"username": player_username, "password": "Password*123"},
    )
    player_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {player_token}"}

    # Attempt to access daily report
    res_daily = client.get("/api/v1/admin/reports/daily", headers=headers)
    assert res_daily.status_code == 403
    assert "administrative privileges required" in res_daily.json()["detail"].lower()

    # Attempt to access user report
    res_user = client.get("/api/v1/admin/reports/users", headers=headers)
    assert res_user.status_code == 403


def test_admin_can_access_reports(client: TestClient):
    admin_name = f"Admin{uuid.uuid4().hex[:6]}"
    admin_pass = "AdminPass#2026"
    create_or_update_admin(admin_name, admin_pass)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": admin_name, "password": admin_pass},
    )
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Access daily report
    daily_res = client.get("/api/v1/admin/reports/daily", headers=headers)
    assert daily_res.status_code == 200
    assert isinstance(daily_res.json(), list)

    # Access user report
    user_res = client.get("/api/v1/admin/reports/users", headers=headers)
    assert user_res.status_code == 200
    assert isinstance(user_res.json(), list)

    # Access summary stats
    summary_res = client.get("/api/v1/admin/reports/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert "total_players" in summary
    assert "total_games_played" in summary
    assert "overall_win_rate" in summary
