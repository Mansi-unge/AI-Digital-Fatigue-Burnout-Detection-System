from backend.database.database import engine
from backend.database.models.users import Base
from backend.database.models.activity import Base

def init_database():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    init_database()