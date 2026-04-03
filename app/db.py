from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set. Please check your .env file.")

DB_NAME = os.getenv("DB_NAME", "teammate_matcher")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

profiles_collection = db["profiles"]
projects_collection = db["projects"]
requests_collection = db["requests"]
rooms_collection = db["rooms"]
messages_collection = db["messages"]
feedback_collection = db["feedback"]