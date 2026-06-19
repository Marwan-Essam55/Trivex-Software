from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from schemas.user_schema import UserCreate, UserProfileResponse, UserUpdate, UserResetPassword
from services import user_service
from core.security import get_db, get_current_admin_user
from models.user import User, UserRole

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"],
    dependencies=[Depends(get_current_admin_user)]  
)

@router.post("/", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    is_super_admin = (current_admin.email == "admin@admin.com" or not current_admin.company_name)
    if is_super_admin:
        user.role = UserRole.ADMIN
        if not user.company_name:
            raise HTTPException(status_code=400, detail="Company name is required for new company admins")
        user.first_name = user.company_name
        user.last_name = "Admin"
        user.title = None
    else:
        user.role = UserRole.USER
        user.company_name = current_admin.company_name
        if not user.first_name or not user.last_name:
            raise HTTPException(status_code=400, detail="First name and last name are required")
        
    return user_service.create_user(db=db, user=user, created_by_id=current_admin.id)

@router.get("/", response_model=List[UserProfileResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    is_super_admin = (current_admin.email == "admin@admin.com" or not current_admin.company_name)
    if is_super_admin:
        return user_service.get_all_users(db, skip=skip, limit=limit)
    else:
        return user_service.get_users_by_creator(db, creator_id=current_admin.id, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserProfileResponse)
def update_user(user_id: uuid.UUID, user_in: UserUpdate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.update_user(db=db, db_user=db_user, user_in=user_in)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user_service.delete_user(db=db, db_user=db_user)
    return None

@router.post("/{user_id}/reset-password", response_model=UserProfileResponse)
def reset_password(user_id: uuid.UUID, payload: UserResetPassword, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.reset_user_password(db=db, db_user=db_user, new_password=payload.new_password)

@router.post("/{user_id}/toggle-status", response_model=UserProfileResponse)
def toggle_status(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.toggle_user_status(db=db, db_user=db_user)
