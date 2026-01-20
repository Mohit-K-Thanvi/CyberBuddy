from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

# -------------------- DATABASE -------------------- #
from app.core.database import engine, Base
from app.models.user import User  # ensure models are registered
from app.models.scan import ScanHistory

# -------------------- ROUTERS -------------------- #
from app.api.auth import router as auth_router
from app.api.auth_social import router as social_router
from app.api.ai_scan import router as ai_scan_router
from app.api.email_scan import router as email_scan_router
from app.api.visual_scan import router as visual_scan_router
from app.api.password_scan import router as password_scan_router
from app.api.report import router as report_router
from app.api.chatbot import router as chatbot_router
from app.api.news import router as news_router
from app.api.training import router as training_router

# -------------------- APP INIT -------------------- #
app = FastAPI(
    title="CyberBuddy API",
    version="2.0.0",
    description="CyberBuddy Backend API (Web + Chrome Extension + AI Engine)"
)

# -------------------- STARTUP -------------------- #
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# -------------------- MIDDLEWARE -------------------- #

# Required for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key="SUPER_SECRET_KEY_CHANGE_LATER"
)

# CORS (Web + Chrome Extension)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- ROUTES -------------------- #

# Auth (email/password)
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# Social OAuth
app.include_router(social_router, prefix="/auth", tags=["Social Auth"])

# ✅ AI URL Scanner
app.include_router(ai_scan_router)
app.include_router(email_scan_router)
app.include_router(visual_scan_router)
app.include_router(password_scan_router)
app.include_router(report_router)
app.include_router(chatbot_router)
app.include_router(news_router)

# 🆕 New Features
app.include_router(training_router)

# -------------------- HEALTH -------------------- #

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "CyberBuddy Backend",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {"message": "CyberBuddy backend running successfully"}
