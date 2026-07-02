from config import settings

try:
    from pymongo import MongoClient
except ImportError:  # pragma: no cover - allows local fallback before deps are installed
    MongoClient = None

_client = None


def get_mongo_client():
    global _client
    if MongoClient is None or not settings.MONGODB_URI:
        return None
    if _client is None:
        try:
            _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=500, connectTimeoutMS=500)
        except Exception:
            return None
    return _client


def get_database():
    client = get_mongo_client()
    if client is None:
        return None
    return client[settings.MONGODB_DB]


def get_database_status():
    client = get_mongo_client()
    if client is None:
        return {"database": "json-fallback", "connected": False}
    try:
        client.admin.command("ping")
        return {"database": "mongodb", "connected": True, "name": settings.MONGODB_DB}
    except Exception:
        return {"database": "json-fallback", "connected": False, "name": settings.MONGODB_DB}
