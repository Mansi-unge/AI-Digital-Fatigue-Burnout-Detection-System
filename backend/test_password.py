from backend.auth.password_utils import hash_password, verify_password

password = "Research@123"

# Hash password
hashed = hash_password(password)

print("Original Password :", password)
print("Hashed Password   :", hashed)

# Verify correct password
print("Correct Password :", verify_password(password, hashed))

# Verify wrong password
print("Wrong Password   :", verify_password("Hello123", hashed))