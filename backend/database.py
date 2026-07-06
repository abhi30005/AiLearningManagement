from config import settings
import time

try:
    from pymongo import MongoClient
except ImportError:  # pragma: no cover - allows local fallback before deps are installed
    MongoClient = None

_client = None
_last_error = ""


def get_mongo_client():
    global _client, _last_error
    if MongoClient is None:
        _last_error = "pymongo is not installed."
        return None
    if not settings.MONGODB_URI:
        _last_error = "MONGODB_URI is not set."
        return None
    if _client is None:
        try:
            _client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            )
        except Exception as exc:
            _last_error = str(exc)
            return None
    return _client


def get_database():
    client = get_mongo_client()
    if client is None:
        return None
    return client[settings.MONGODB_DB]


def get_database_status():
    global _last_error
    client = get_mongo_client()
    if client is None:
        return {"database": "disconnected", "connected": False, "detail": _last_error}
    try:
        client.admin.command("ping")
        _last_error = ""
        return {"database": "mongodb", "connected": True, "name": settings.MONGODB_DB}
    except Exception as exc:
        _last_error = str(exc)
        return {"database": "disconnected", "connected": False, "name": settings.MONGODB_DB, "detail": _last_error}


def wait_for_database():
    if not settings.MONGODB_URI:
        raise Exception("MongoDB connection failed: MONGODB_URI is empty.")

    attempts = max(settings.MONGODB_CONNECT_ATTEMPTS, 1)
    for attempt in range(1, attempts + 1):
        status = get_database_status()
        if status.get("connected"):
            return status
        if attempt < attempts:
            time.sleep(settings.MONGODB_RETRY_DELAY_SECONDS)

    raise Exception("MongoDB not connected. All attempts failed.")

def get_collection(name: str):
    db = get_database()
    if db is None:
        raise Exception("Database not connected")
    return db[name]
