from database import get_database
from config import settings
from state_store import purge_demo_data

def migrate():
    db = get_database()
    if db is None:
        print("Database not connected")
        return

    if not settings.SEED_DEMO_DATA:
        deleted = purge_demo_data()
        print("SEED_DEMO_DATA=false. Removed existing demo data and kept only the system admin.")
        for collection_name, count in deleted.items():
            print(f"Deleted {count} records from {collection_name}.")
        return

    doc = db['app_state'].find_one({'_id': 'app-state'})
    if not doc or 'state' not in doc:
        print("No monolithic state found to migrate.")
        return

    state = doc['state']
    
    collections_to_migrate = [
        'users', 'courses', 'categories', 'enrollments', 
        'assignments', 'submissions', 'materials', 
        'chatHistory', 'notifications', 'notes', 'flashcards'
    ]

    for coll_name in collections_to_migrate:
        if coll_name in state and isinstance(state[coll_name], list) and len(state[coll_name]) > 0:
            coll = db[coll_name]
            # Clear existing data just in case
            coll.delete_many({})
            # Insert the array of dicts
            coll.insert_many(state[coll_name])
            print(f"Migrated {len(state[coll_name])} records into {coll_name} collection.")
        else:
            print(f"No records to migrate for {coll_name}.")

    # settings is a dict mapping user_id -> settings
    if 'settings' in state and isinstance(state['settings'], dict):
        settings_coll = db['settings']
        settings_coll.delete_many({})
        docs_to_insert = []
        for user_id, user_settings in state['settings'].items():
            user_settings['user_id'] = user_id
            docs_to_insert.append(user_settings)
        if docs_to_insert:
            settings_coll.insert_many(docs_to_insert)
            print(f"Migrated {len(docs_to_insert)} records into settings collection.")

    print("Migration complete. The new structured collections are ready to be used.")

if __name__ == "__main__":
    migrate()
