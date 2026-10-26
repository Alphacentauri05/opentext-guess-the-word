# OpenText "Guess the Word" Web Application

A full-stack, enterprise-grade word guessing game web application built for **OpenText**. The application features user authentication with strict credential policies, role-based access control (`PLAYER` and `ADMIN`), an active 5-letter uppercase word bank seeded in PostgreSQL, persistent game state, atomic daily play limits (3 words per day), personal game histories, and comprehensive administrative reporting.

---

## 1. Requirements Compliance & Verification Matrix

| Requirement | OpenText Specification | Implementation Detail | Status |
|---|---|---|---|
| **Role-Based Access** | Admin user (reports) & Player user (plays game) | FastAPI dependency injection (`require_admin`), React `ProtectedRoute` | ✅ Verified |
| **Username Rules** | $\ge 5$ characters, both uppercase & lowercase | Pydantic regex validator + frontend live indicator | ✅ Verified |
| **Password Rules** | $\ge 5$ characters, alpha, numeric & special (`$`, `%`, `*`, `&`, `#`, `@`, `!`) | Pydantic regex validator + Argon2id secure hashing | ✅ Verified |
| **Word Bank** | Minimum 20 five-letter uppercase English words | PostgreSQL `words` table + repeatable seeder `python -m scripts.seed_words` | ✅ Verified |
| **Daily Game Limit** | Maximum 3 words per day per user | Atomic `SELECT ... FOR UPDATE` concurrency lock in PostgreSQL | ✅ Verified |
| **5x5 Grid Gameplay** | Max 5 guesses, 5-letter uppercase submissions | React 5x5 letter grid with tile animations + physical/virtual keyboard | ✅ Verified |
| **Color Feedback** | Green (exact), Orange (wrong position), Grey (absent) | Server-side two-pass evaluation algorithm with repeated-letter handling | ✅ Verified |
| **Game State Persistence** | Resume unfinished game without burning quota | In-progress game resume via `POST /api/v1/games/start` & `GET /api/v1/games/active` | ✅ Verified |
| **Game History** | Date/time, word attempted, attempts used, win/loss, correct count | Persistent `games` & `guesses` tables via `GET /api/v1/games/history` | ✅ Verified |
| **Admin Reports** | Daily Report (users & correct guesses) + User Report (date, words, wins) | SQL aggregated endpoints `GET /api/v1/admin/reports/*` + KPI dashboard | ✅ Verified |

---

## 2. Technology Stack

- **Frontend**:
  - React 19 + TypeScript (Strict Type Checking)
  - Vite 8 (Ultra-fast HMR and bundle build)
  - React Router DOM 7
  - Tailwind CSS v4 (Modern responsive utility system)
  - Lucide React (Clean icon system)
  - Typed API Client with Bearer token authentication
- **Backend**:
  - Python 3.11
  - FastAPI (High-performance async web framework)
  - Pydantic v2 (Input validation & serialization)
  - SQLAlchemy 2.0 (Relational ORM & SQL expressions)
  - Alembic (Database migrations)
  - Psycopg 3 (PostgreSQL binary driver)
  - Passlib + Argon2-cffi (Secure password hashing)
  - Python-Jose (Signed JWT access tokens)
  - Pytest (Automated unit and integration test suite)
- **Database**:
  - PostgreSQL 18 / Supabase PostgreSQL
  - Relational integrity: Foreign keys, indexes, unique constraints, and atomic row-level locks

---

## 3. Project Architecture & Directory Layout

```
opentext-guess-the-word/
├── backend/
│   ├── alembic/              # Alembic migration scripts
│   ├── app/
│   │   ├── api/              # API router and dependencies
│   │   │   ├── deps.py       # Auth & Admin route guards
│   │   │   └── v1/           # /auth, /games, /admin routers
│   │   ├── core/             # Configuration & security utilities
│   │   ├── db/               # Engine and session initialization
│   │   ├── models/           # SQLAlchemy entity definitions (User, Word, Game, Guess, DailyGameUsage)
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   ├── services/         # Game engine, authentication, and reporting services
│   │   └── main.py           # FastAPI entrypoint & middleware
│   ├── scripts/
│   │   ├── seed_words.py     # Populates 20 verified 5-letter uppercase words
│   │   └── create_admin.py   # Secure admin user bootstrap CLI
│   ├── tests/                # Automated pytest suite (17 tests)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Sample environment configuration
├── frontend/
│   ├── src/
│   │   ├── api/              # Typed REST client
│   │   ├── components/       # WordGrid, Keyboard, Navbar, GameResultModal, ProtectedRoute
│   │   ├── contexts/         # AuthContext
│   │   ├── pages/            # Login, Register, Dashboard, Game, History, Admin
│   │   ├── types/            # TypeScript data contracts
│   │   ├── App.tsx           # Route mapping
│   │   └── main.tsx          # React application root
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # Strict TypeScript compiler options
│   └── vite.config.ts        # Vite configuration with proxy to FastAPI
├── .gitignore                # Excludes secrets, caches, and node_modules
└── README.md                 # Complete documentation
```

---

## 4. Database Schema

```mermaid
erDiagram
    users ||--o{ games : "plays"
    users ||--o{ daily_game_usage : "tracks limit"
    words ||--o{ games : "secret word"
    games ||--o{ guesses : "attempts"

    users {
        uuid id PK
        varchar(100) username UK
        varchar(255) password_hash
        varchar(20) role "PLAYER | ADMIN"
        timestamptz created_at
    }

    words {
        int id PK
        varchar(5) word UK
        boolean is_active
        timestamptz created_at
    }

    games {
        uuid id PK
        uuid user_id FK
        int word_id FK
        varchar(20) status "IN_PROGRESS | WON | LOST"
        int attempts_used "0 to 5"
        date game_date
        timestamptz started_at
        timestamptz completed_at
    }

    guesses {
        uuid id PK
        uuid game_id FK
        int guess_number "1 to 5"
        varchar(5) guess_word
        jsonb feedback "[GREEN, ORANGE, GREY, ...]"
        timestamptz created_at
    }

    daily_game_usage {
        uuid id PK
        uuid user_id FK
        date usage_date
        int games_count "0 to 3"
    }
```

---

## 5. Getting Started & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL database (Local PostgreSQL or Supabase)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual or Conda environment:
   ```bash
   # Using conda
   conda create -n opentext_wordle python=3.11 -y
   conda activate opentext_wordle

   # Or using standard venv
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your `DATABASE_URL` (for local PostgreSQL or Supabase):
   ```ini
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/opentext_guess_word
   SECRET_KEY=your_generated_secret_key
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Seed the 20 initial five-letter words:
   ```bash
   python -m scripts.seed_words
   ```

7. Provision the initial Administrator account:
   ```bash
   python -m scripts.create_admin --username AdminUser --password Admin@123
   ```

8. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API interactive documentation is available at: **http://127.0.0.1:8000/api/v1/docs**

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at: **http://127.0.0.1:5173/**

---

## 6. Running Automated Tests

### Backend Tests
Execute the comprehensive test suite covering validation, game mechanics, daily limits, and administrative authorization:
```bash
cd backend
python -m pytest tests -v
```
**Test Results**: 17 tests passed (100% pass rate).

### Frontend Type & Build Verification
Verify strict TypeScript compilation and production bundle build:
```bash
cd frontend
npm run build
```

---

## 7. API Reference Summary

### Authentication (`/api/v1/auth`)
- `POST /register`: Registers a new player account (`PLAYER` role).
- `POST /login`: Authenticates credentials and returns JWT bearer token.
- `GET /me`: Returns authenticated user profile.

### Games (`/api/v1/games`)
- `POST /start`: Starts a new game or resumes an in-progress game (enforcing 3 words/day limit).
- `GET /active`: Retrieves currently active game session.
- `GET /quota`: Returns today's quota usage and remaining allowance.
- `POST /{game_id}/guess`: Submits a 5-letter guess and returns color feedback.
- `GET /history`: Returns personal game history for the logged-in player.

### Administration (`/api/v1/admin`)
- `GET /reports/daily`: Returns daily activity metrics (date, active users, correct guesses).
- `GET /reports/users`: Returns user activity metrics (username, date, words tried, correct guesses).
- `GET /reports/summary`: Returns system KPI metrics (players, total games, win rate).

---

## 8. Default Credentials for Evaluation

- **Administrator**:
  - **Username**: `AdminUser`
  - **Password**: `Admin@123`
- **Player Registration**:
  - Open **http://127.0.0.1:5173/register**
  - Choose any username with $\ge 5$ letters (both upper and lower case, e.g. `PlayerOne`)
  - Choose any password with $\ge 5$ characters (containing letters, numbers, and special characters, e.g. `Player@123`)
