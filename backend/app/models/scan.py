from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    prediction = Column(String, nullable=False) # legitimate, phishing, suspicious
    confidence = Column(Float, nullable=False)
    source = Column(String, default="web") # web, extension, email
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
