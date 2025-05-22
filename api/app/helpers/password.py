import bcrypt

def byte_encode(text: str) -> bytes:
    return text.encode('utf-8')

def create_hash_Password(password: str):
    return bcrypt.hashpw(byte_encode(password), bcrypt.gensalt())

def verify_hash_password(password: str, hash_password: str):
    return bcrypt.checkpw(byte_encode(password), byte_encode(hash_password))



