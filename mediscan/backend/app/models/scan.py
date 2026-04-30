import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, JSON, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    barcode: Mapped[str] = mapped_column(String(50), index=True)
    product_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(120), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    product_data: Mapped[dict | None] = mapped_column(JSON, default=dict)
    verdict: Mapped[str | None] = mapped_column(String(10), nullable=True)  # SAFE/CAUTION/DANGER
    flags: Mapped[list | None] = mapped_column(JSON, default=list)
    scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
