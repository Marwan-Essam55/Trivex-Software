from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user_schema import RegisterUser, UserProfileResponse, Token, GoogleAuthToken
from services import user_service, auth_service
from database.session import get_db
from core.security import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: RegisterUser, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_registered_user(db=db, user=user)

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, form_data)

@router.post("/google", response_model=Token)
def login_with_google(google_token: GoogleAuthToken, db: Session = Depends(get_db)):
    """
    Authenticate using a Google OAuth token.
    Validates token, checks if user email exists in DB, and sets google_id if not present.
    """
    return auth_service.authenticate_google_user(db, google_token.token)

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    Password and other sensitive data are excluded by the response model.
    """
    return current_user

@router.post("/logout")
def logout():
    """
    Since we are using stateless JWTs, true logout is handled client-side
    by removing the token. This endpoint serves as a clear hook if we 
    want to add server-side token invalidation (e.g. blocklist) later.
    """
    return {"message": "Successfully logged out. Please remove the token from your client."}

