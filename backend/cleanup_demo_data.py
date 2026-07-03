import sys

from config import settings
from state_store import purge_demo_data


def main() -> int:
    if "--yes" not in sys.argv:
        print("This will delete demo users, courses, enrollments, assignments, submissions, materials, notifications, chat history, notes, flashcards, and old app_state data.")
        print("Run again with --yes to confirm.")
        return 1

    deleted = purge_demo_data()
    print("Demo data cleanup complete.")
    print(f"System admin email: {settings.DEFAULT_ADMIN_EMAIL}")
    print("System admin password comes from DEFAULT_ADMIN_PASSWORD.")
    for collection_name, count in deleted.items():
        print(f"{collection_name}: deleted {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
