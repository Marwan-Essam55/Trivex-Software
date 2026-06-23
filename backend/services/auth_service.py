from datetime import timedelta

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from core.config import settings
from core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from services.user_service import get_user_by_email, create_google_user


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

    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role.value.lower(),
            "user_id": str(user.id),
            "company_name": user.company_name or "",
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


def authenticate_google_user(db: Session, token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google authentication token",
        )

    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    picture = idinfo.get("picture")
    given_name = idinfo.get("given_name", "")
    family_name = idinfo.get("family_name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token does not contain an email",
        )

    user = get_user_by_email(db, email=email)

    if not user:
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

    # Update google_id and profile_picture_url (if empty)
    updated = False
    if not user.google_id:
        user.google_id = google_id
        updated = True
    if not user.profile_picture_url and picture:
        user.profile_picture_url = picture
        updated = True
    if updated:
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role.value.lower(),
            "user_id": str(user.id),
            "company_name": user.company_name or "",
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}
