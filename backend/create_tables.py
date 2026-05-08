from app.models import *


print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
