from database import get_collection
from utils.security import get_password_hash
hash_val = get_password_hash('admin123')
res = get_collection('users').update_one({'email': 'admin@eduai.edu'}, {'$set': {'password': hash_val}})
print(f'Matched: {res.matched_count}, Modified: {res.modified_count}')
