import os
from urllib.parse import urlencode
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.utils.auth import hash_password

load_dotenv()

router = APIRouter(tags=["Social-Auth"])

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "TEMP_SECRET")
JWT_ALG = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

config_data = {
    "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID"),
    "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET"),
    "GITHUB_CLIENT_ID": os.getenv("GITHUB_CLIENT_ID"),
    "GITHUB_CLIENT_SECRET": os.getenv("GITHUB_CLIENT_SECRET"),
    "DISCORD_CLIENT_ID": os.getenv("DISCORD_CLIENT_ID"),
    "DISCORD_CLIENT_SECRET": os.getenv("DISCORD_CLIENT_SECRET"),
}

config = Config(environ=config_data)
oauth = OAuth(config)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)


# Register OAuth Providers
oauth.register(
    name="google",
    client_id=config_data["GOOGLE_CLIENT_ID"],
    client_secret=config_data["GOOGLE_CLIENT_SECRET"],
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=config_data["GITHUB_CLIENT_ID"],
    client_secret=config_data["GITHUB_CLIENT_SECRET"],
    authorize_url="https://github.com/login/oauth/authorize",
    access_token_url="https://github.com/login/oauth/access_token",
    client_kwargs={"scope": "user:email"},
)

oauth.register(
    name="discord",
    client_id=config_data["DISCORD_CLIENT_ID"],
    client_secret=config_data["DISCORD_CLIENT_SECRET"],
    authorize_url="https://discord.com/api/oauth2/authorize",
    access_token_url="https://discord.com/api/oauth2/token",
    client_kwargs={"scope": "identify email"},
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def find_or_create_user(db: Session, email: str, name: str = ""):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    new_user = User(email=email, hashed_password=hash_password("social_login"))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/{provider}")
async def oauth_login(provider: str, request: Request):
    if provider not in ("google", "github", "discord"):
        return JSONResponse({"error": "Unsupported provider"}, status_code=400)

    redirect_uri = f"{BASE_URL}/auth/{provider}/callback"
    client = oauth.create_client(provider)
    return await client.authorize_redirect(request, redirect_uri)


@router.get("/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    client = oauth.create_client(provider)
    token = await client.authorize_access_token(request)

    if provider == "google":
        # Use userinfo endpoint instead of parse_id_token (more reliable)
        userinfo = token.get("userinfo")
        if not userinfo:
            # Fallback: fetch from userinfo endpoint
            resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", token=token)
            userinfo = resp.json()
        email = userinfo.get("email")

    elif provider == "github":
        profile = (await client.get("https://api.github.com/user", token=token)).json()
        email = profile.get("email")
        if not email:
            emails = (await client.get("https://api.github.com/user/emails", token=token)).json()
            primary = next((e for e in emails if e.get("primary")), emails[0])
            email = primary["email"]

    elif provider == "discord":
        profile = (await client.get("https://discord.com/api/users/@me", token=token)).json()
        email = profile.get("email")

    if not email:
        return JSONResponse({"error": "No email returned"}, status_code=400)

    user = find_or_create_user(db, email=email)

    jwt_token = create_access_token({"sub": user.email, "id": user.id})
    redirect_url = f"{FRONTEND_URL}/auth/callback?token={jwt_token}"

    return RedirectResponse(redirect_url)
