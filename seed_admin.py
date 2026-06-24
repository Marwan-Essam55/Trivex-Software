import logging
from core.config import settings
from database.session import SessionLocal
from models.user import User, UserRole
from models.video import Video
from models.feedback import Feedback
from core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_admin():
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        logger.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.")
        return

    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin_user:
            logger.info(f"Admin user already exists with email: {settings.ADMIN_EMAIL}")
            return

        # Create new admin user
        logger.info(f"Password length: {len(settings.ADMIN_PASSWORD)}")
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        new_admin = User(
            first_name="Admin",
            last_name="User",
            email=settings.ADMIN_EMAIL,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True,
            available_credits=1000  # Give admin plenty of credits
        )

        db.add(new_admin)
        db.commit()
        logger.info(f"Successfully created admin user with email: {settings.ADMIN_EMAIL}")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting admin seeding process...")
    seed_admin()
