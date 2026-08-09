from datetime import datetime

from sqlalchemy import Column, Integer, Float, Boolean, DateTime

from backend.database.database import Base


class IoTData(Base):
    __tablename__ = "iot_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    temperature = Column(
        Float,
        nullable=True
    )

    humidity = Column(
        Float,
        nullable=True
    )

    light = Column(
        Float,
        nullable=True
    )

    distance = Column(
        Float,
        nullable=True
    )

    motion = Column(
        Boolean,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )