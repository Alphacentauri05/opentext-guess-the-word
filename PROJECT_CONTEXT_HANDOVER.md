# OpenText "Guess the Word" — Complete Project Handover & Context Document

This document provides a comprehensive record of the entire engineering implementation, architectural decisions, database setup, game mechanics, and test verifications performed for the **OpenText Guess the Word** project.

---

## 1. Project Background & OpenText Requirements

### Source Specification
* **Document:** `OpenText Pre-boarding Training Material_FY27 October.pdf` (Pages 2 & 3).
* **Delivery Deadline:** 26th October 2026.
* **GitHub Repository:** [https://github.com/Alphacentauri05/opentext-guess-the-word](https://github.com/Alphacentauri05/opentext-guess-the-word)

### Explicit Constraints & Rules
1. **User Roles:**
   - `PLAYER`: Registers, logs in, plays games (subject to daily limits), views personal game history.
   - `ADMIN`: Logs in, accesses administrative reports (daily activity and user performance). Cannot be created via open registration.
2. **Registration Credentials Validation:**
   - **Username:** At least 5 letters, must contain **both uppercase and lowercase letters**. Unique in the database.
   - **Password:** At least 5 characters, must contain **letters, numbers, and special characters** (`$`, `%`, `*`, `&`, `#`, `@`, `!`).
   - Passwords must be hashed cryptographically using **Argon2id** (never stored in plaintext).
3. **Word Bank:**
   - At least twenty (20) five-letter uppercase English words stored in PostgreSQL.
4. **Game Mechanics:**
   - Exactly 5-letter uppercase words.
   - Maximum 5 guesses per game.
   - Two-pass color feedback evaluation:
     - **GREEN:** Correct letter in correct position.
     - **ORANGE:** Correct letter in wrong position.
     - **GREY:** Letter absent from secret word.
   - Exact repeated-letter handling: Letters that appear only once in the secret word will not be highlighted orange twice if guessed multiple times.
5. **Win / Loss Flow:**
   - Win: User matches word $\rightarrow$ Congratulatory modal $\rightarrow$ Click OK to stop game and return to dashboard.
   - Loss: 5 failed attempts $\rightarrow$ "Better luck next time" modal revealing the word $\rightarrow$ Click OK to stop game and return to dashboard.
6. **Daily Limits & Resumption:**
   - Maximum 3 words per player per calendar day (server date).
   - Atomic database locking (`SELECT ... FOR UPDATE`) prevents concurrent race conditions.
   - In-progress games resume on refresh or re-login without consuming another daily game slot.
7. **Administrative Reports:**
   - **Daily Activity Report:** Date, number of distinct users, and number of correct guesses (games won).
   - **User-Level Report:** Username, date, number of words tried, and number of correct guesses.

---

## 2. Technology Stack & Architectural Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Strict type checking, modern component architecture. |
| **Styling** | Tailwind CSS v4 | Responsive utility classes, custom letter-tile animations. |
| **Build Tool** | Vite 8 | Fast HMR and sub-second production builds (`npm run build`). |
| **Backend** | Python 3.11 + FastAPI | Async high performance, automatic OpenAPI documentation at `/api/v1/docs`. |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Enterprise schema versioning and relational constraints. |
| **Database** | PostgreSQL 18 / Supabase | ACID transactions, foreign keys, row-level locks, JSONB feedback storage. |
| **Driver** | Psycopg 3 (`psycopg-binary`) | Modern, standard PostgreSQL binary driver for Python. |
| **Security** | Argon2id + Python-Jose | Memory-hard password hashing and signed JWT bearer tokens. |
| **Test Suite** | Pytest + FastAPI TestClient | 17 automated tests covering validation, game engine, and reports. |

---

## 3. Database Architecture & Schema

### PostgreSQL Connection
* **Database Name:** `opentext_guess_word`
* **Host / Port:** `localhost:5432`
* **Default URL:** `postgresql://postgres@localhost:5432/opentext_guess_word`
* **Supabase Compatibility:** Fully compatible by replacing `DATABASE_URL` in `backend/.env`.

### Core Tables
1. **`users`**: `id` (UUID PK), `username` (VARCHAR UNIQUE), `password_hash` (Argon2id), `role` (`'PLAYER'` | `'ADMIN'`), `created_at` (TIMESTAMPTZ).
2. **`words`**: `id` (INT PK), `word` (VARCHAR(5) UNIQUE), `is_active` (BOOL), `created_at` (TIMESTAMPTZ).
3. **`games`**: `id` (UUID PK), `user_id` (FK `users.id`), `word_id` (FK `words.id`), `status` (`'IN_PROGRESS'`, `'WON'`, `'LOST'`), `attempts_used` (0-5), `game_date` (DATE), `started_at`, `completed_at`.
4. **`guesses`**: `id` (UUID PK), `game_id` (FK `games.id`), `guess_number` (1-5), `guess_word` (VARCHAR(5)), `feedback` (JSONB), `created_at`.
5. **`daily_game_usage`**: `id` (UUID PK), `user_id` (FK `users.id`), `usage_date` (DATE), `games_count` (0-3), `UNIQUE(user_id, usage_date)`.

---

## 4. The 20 Initial 5-Letter Words Seeded

Seeded via `backend/scripts/seed_words.py`:
1. `TOWER` (OpenText specification winning example)
2. `TONER` (OpenText specification example)
3. `POKER` (OpenText specification example)
4. `HOMER` (OpenText specification example)
5. `AUDIO` (OpenText specification example)
6. `ALERT`
7. `BRAIN`
8. `CRANE`
9. `DRIVE`
10. `EAGLE`
11. `FLASH`
12. `GIANT`
13. `HONEY`
14. `IVORY`
15. `JUDGE`
16. `KNIFE`
17. `LEMON`
18. `MAGIC`
19. `NIGHT`
20. `OCEAN`

---

## 5. Default Credentials & Test Accounts

* **Admin User:**
  - **Username:** `AdminUser`
  - **Password:** `Admin@123`
  - *(Created via `python -m scripts.create_admin`)*
* **Player User:**
  - Register any user meeting criteria (e.g., `TestPlayer` / `Player@1234`).

---

## 6. How to Run the Application

### 1. Start the Backend API
```powershell
cd "e:\opentext demo\backend"
conda activate opentext_wordle
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: **http://127.0.0.1:8000/api/v1/docs**

### 2. Start the Frontend Web App
```powershell
cd "e:\opentext demo\frontend"
npm run dev
```
Web Application: **http://localhost:5173**

---

## 7. Automated Test Verification Results

Run backend test suite:
```powershell
cd "e:\opentext demo\backend"
python -m pytest tests -v
```
**Results:** 17 passed in 1.58s (100% pass rate).

Frontend TypeScript verification:
```powershell
cd "e:\opentext demo\frontend"
npm run build
```
**Results:** Compiled with 0 errors in 537ms.
