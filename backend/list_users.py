from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()

users = db.query(User).all()
for u in users:
    print("ID:", u.id, "Email:", u.email)

db.close()
