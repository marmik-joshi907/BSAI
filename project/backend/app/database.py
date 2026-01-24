from pymongo import MongoClient
# from config import MONGO_URI, DB_NAME
from app.config import MONGO_URI, DB_NAME


client = MongoClient(MONGO_URI)
db = client[DB_NAME]
scan_collection = db["scans"]
