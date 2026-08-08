from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Boolean
)
from sqlalchemy.orm import relationship

from backend.database.database import Base


class User(Base):
    __tablename__ = "users"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Personal Information
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    mobile_number = Column(String(15), unique=True, nullable=False)

    date_of_birth = Column(Date, nullable=False)
    address = Column(String(255), nullable=True)

    # Student / Employee
    designation = Column(String(20), nullable=False)

    # Authentication
    password_hash = Column(String(255), nullable=False)

    # Verification Status
    email_verified = Column(Boolean, default=False)
    mobile_verified = Column(Boolean, default=False)

    # Account Status
    is_active = Column(Boolean, default=True)

    # Created Date
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activities = relationship(
        "Activity",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.name}>"