from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Task(Base):
    """Task database model."""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="TODO", nullable=False)  # TODO, IN_PROGRESS, COMPLETED
    priority = Column(String, default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, URGENT
    category = Column(String, nullable=True)  # WORK, PERSONAL, SHOPPING, etc.
    due_date = Column(DateTime, nullable=True)
    start_time = Column(String, nullable=True)  # Time in HH:MM format
    end_time = Column(String, nullable=True)  # Time in HH:MM format
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="tasks")
