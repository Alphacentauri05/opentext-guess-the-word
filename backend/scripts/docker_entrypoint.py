import time
import subprocess
import sys
import logging
from sqlalchemy import create_engine, text
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("docker_entrypoint")


def wait_for_db(max_retries: int = 30, delay: float = 1.5):
    """Wait for PostgreSQL database to become available and accept connections."""
    logger.info("Checking database connectivity at: %s", settings.DATABASE_URL.split("@")[-1])
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1;"))
            logger.info("Database connection established successfully!")
            return
        except Exception as e:
            logger.warning(
                "Database not ready yet (attempt %d/%d). Retrying in %.1fs... (%s)",
                attempt,
                max_retries,
                delay,
                str(e).split("\n")[0],
            )
            time.sleep(delay)

    logger.error("Could not connect to database after %d attempts. Exiting.", max_retries)
    sys.exit(1)


def run_migrations_and_seed():
    """Apply Alembic migrations, seed word bank, and bootstrap default admin."""
    logger.info("Applying database migrations (alembic upgrade head)...")
    subprocess.run(["alembic", "upgrade", "head"], check=True)

    logger.info("Seeding initial 20-word bank...")
    from scripts.seed_words import seed_words
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        total = seed_words(db)
        logger.info("Word bank verified with %d active words.", total)
    finally:
        db.close()

    logger.info("Ensuring default administrator account exists...")
    from scripts.create_admin import create_or_update_admin
    create_or_update_admin("AdminUser", "Admin@123", update_existing=False)


def start_server():
    """Start the Uvicorn production server."""
    logger.info("Starting Uvicorn server on 0.0.0.0:8000...")
    cmd = [
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
    ]
    subprocess.run(cmd)


if __name__ == "__main__":
    wait_for_db()
    run_migrations_and_seed()
    start_server()
