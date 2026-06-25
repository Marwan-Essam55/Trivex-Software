from sqlalchemy.orm import Session
from models.user import User, UserRole
from schemas.user_schema import UserCreate, UserUpdate, RegisterUser, UserOwnProfileUpdate
from core.security import get_password_hash
import uuid

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.lower()).first()

def get_user_by_id(db: Session, user_id: uuid.UUID):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email.lower(),
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_registered_user(db: Session, user: RegisterUser):
    """Create a user from self-registration — always USER role."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email.lower(),
        hashed_password=hashed_password,
        role=UserRole.USER
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_google_user(db: Session, email: str, first_name: str, last_name: str, google_id: str, profile_picture_url: str = None):
    """Create a new user from Google OAuth data. Uses a random placeholder password since the user will only authenticate via Google."""
    placeholder_password = get_password_hash(str(uuid.uuid4()))
    db_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email.lower(),
        hashed_password=placeholder_password,
        google_id=google_id,
        profile_picture_url=profile_picture_url,
        role=UserRole.USER,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, db_user: User, user_in: UserUpdate):
    update_data = user_in.dict(exclude_unset=True)
    if 'email' in update_data and update_data['email']:
        update_data['email'] = update_data['email'].lower()
    for field in update_data:
        setattr(db_user, field, update_data[field])
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_own_profile(db: Session, db_user: User, profile_in: UserOwnProfileUpdate):
    """Update a user's own profile — restricted to first_name and last_name only."""
    update_data = profile_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_user, field, update_data[field])
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, db_user: User):
    db.delete(db_user)
    db.commit()
    return db_user

def reset_user_password(db: Session, db_user: User, new_password: str):
    hashed_password = get_password_hash(new_password)
    db_user.hashed_password = hashed_password
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def toggle_user_status(db: Session, db_user: User):
    db_user.is_active = not db_user.is_active
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

