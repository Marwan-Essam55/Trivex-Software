from fastapi import APIRouter

router = APIRouter()

# API Team: Call the respective functions from the `services/` directory here and return the response to the React frontend.
@router.get("/profile")
def profile():
    pass
