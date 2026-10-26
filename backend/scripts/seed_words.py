import logging
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.word import Word
from app.services.game_engine import GameEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Twenty 5-letter uppercase English words including the OpenText specification example words
INITIAL_WORDS: List[str] = [
    "TOWER",  # Spec example winner
    "TONER",  # Spec example
    "POKER",  # Spec example
    "HOMER",  # Spec example
    "AUDIO",  # Spec example
    "ALERT",
    "BRAIN",
    "CRANE",
    "DRIVE",
    "EAGLE",
    "FLASH",
    "GIANT",
    "HONEY",
    "IVORY",
    "JUDGE",
    "KNIFE",
    "LEMON",
    "MAGIC",
    "NIGHT",
    "OCEAN",
]


def seed_words(db: Session) -> int:
    """Seed the database with the required initial 20 five-letter uppercase words."""
    logger.info("Starting word bank seeding...")
    added_count = 0

    for raw_word in INITIAL_WORDS:
        clean_word = GameEngine.sanitize_and_validate_word(raw_word)
        existing = db.query(Word).filter(Word.word == clean_word).first()
        if not existing:
            word_entry = Word(word=clean_word, is_active=True)
            db.add(word_entry)
            added_count += 1
            logger.info(f"Adding word: {clean_word}")
        else:
            logger.info(f"Word already exists: {clean_word}")

    db.commit()
    total = db.query(Word).filter(Word.is_active == True).count()
    logger.info(
        f"Seeding completed. Added: {added_count}, Total active words: {total}"
    )
    return total


if __name__ == "__main__":
    db = SessionLocal()
    try:
        total = seed_words(db)
        print(f"SUCCESS: Word bank seeded with {total} active 5-letter words.")
    finally:
        db.close()
