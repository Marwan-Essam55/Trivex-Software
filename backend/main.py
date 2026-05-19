import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.video_controller import router as video_router
from controllers.auth_controller import router as auth_router
from controllers.user_controller import router as user_router
from controllers.admin_user_controller import router as admin_user_router

app = FastAPI(title="Trivex API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "operational", "service": "trivex-api"}

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_user_router)
app.include_router(video_router)
