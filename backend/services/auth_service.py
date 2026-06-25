from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from services.user_service import get_user_by_email, create_google_user
from core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from core.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests

def authenticate_user(db: Session, form_data: OAuth2PasswordRequestForm):
    user = get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value.lower()}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

def authenticate_google_user(db: Session, token: str):
    print(f"[DEBUG] GOOGLE_CLIENT_ID loaded: '{settings.GOOGLE_CLIENT_ID}'")
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
    except Exception as e:
        print(f"[ERROR] Google authentication token verification failed. Exception type: {type(e).__name__}, message: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google authentication token",
        )
    
    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    given_name = idinfo.get("given_name", "")
    family_name = idinfo.get("family_name", "")
    picture = idinfo.get("picture")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token does not contain an email",
        )
        
    user = get_user_by_email(db, email=email)
    
    if not user:
        # Upsert: create a new user from Google profile data
        user = create_google_user(
            db=db,
            email=email,
            first_name=given_name or "Google",
            last_name=family_name or "User",
            google_id=google_id,
            profile_picture_url=picture,
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
        
    # Link google_id if existing user didn't have one
    if not user.google_id:
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value.lower()}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
