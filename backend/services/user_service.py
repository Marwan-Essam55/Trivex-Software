from sqlalchemy.orm import Session
from models.user import User
from schemas.user_schema import UserCreate, UserUpdate
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
