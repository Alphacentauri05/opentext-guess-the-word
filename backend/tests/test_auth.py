import uuid
import pytest
from fastapi.testclient import TestClient


def test_user_registration_success(client: TestClient):
    unique_user = f"User{uuid.uuid4().hex[:6]}"
    payload = {
        "username": unique_user,
        "password": "ValidPassword*123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["username"] == unique_user
    assert data["role"] == "PLAYER"


def test_username_validation_rules(client: TestClient):
    # Less than 5 chars
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "Ab1", "password": "Password*123"},
    )
    assert res.status_code == 422

    # All lowercase (missing uppercase)
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "playerone", "password": "Password*123"},
    )
    assert res.status_code == 422

    # All uppercase (missing lowercase)
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "PLAYERONE", "password": "Password*123"},
    )
    assert res.status_code == 422


def test_password_validation_rules(client: TestClient):
    # Less than 5 chars
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "ValidUser", "password": "P*1"},
    )
    assert res.status_code == 422

    # Missing special character
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "ValidUser", "password": "Password123"},
    )
    assert res.status_code == 422

    # Missing number
    res = client.post(
        "/api/v1/auth/register",
        json={"username": "ValidUser", "password": "Password*"},
    )
    assert res.status_code == 422


def test_duplicate_username_rejected(client: TestClient):
    username = f"Dupe{uuid.uuid4().hex[:6]}"
    payload = {"username": username, "password": "Password*123"}

    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already taken" in res2.json()["detail"].lower()


def test_login_flow(client: TestClient):
    username = f"Login{uuid.uuid4().hex[:6]}"
    password = "MySecurePassword%2026"

    # Register
    client.post(
        "/api/v1/auth/register",
        json={"username": username, "password": password},
    )

    # Valid Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

    # Check /me with token
    me_res = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["username"] == username

    # Invalid Login
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": "WrongPassword*1"},
    )
    assert bad_login.status_code == 401
