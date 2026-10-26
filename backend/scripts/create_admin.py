import argparse
import sys
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash


def create_or_update_admin(
    username: str, password: str, update_existing: bool = False
) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            if update_existing:
                user.password_hash = get_password_hash(password)
                user.role = "ADMIN"
                db.commit()
                print(f"Updated existing user '{username}' to ADMIN.")
            else:
                print(
                    f"User '{username}' already exists. Use --update to change password/role."
                )
                return
        else:
            admin_user = User(
                username=username,
                password_hash=get_password_hash(password),
                role="ADMIN",
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user '{username}' successfully created!")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Bootstrap an initial Admin user for OpenText Guess The Word"
    )
    parser.add_argument(
        "--username",
        default="AdminUser",
        help="Admin username (default: AdminUser)",
    )
    parser.add_argument(
        "--password",
        default="Admin@123",
        help="Admin password (default: Admin@123)",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update password if user already exists",
    )

    args = parser.parse_args()
    create_or_update_admin(
        args.username, args.password, update_existing=args.update
    )
