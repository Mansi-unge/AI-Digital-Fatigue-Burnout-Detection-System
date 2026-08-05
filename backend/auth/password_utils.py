"""
Password Utility Module

This module handles:
1. Password Hashing
2. Password Verification
"""

from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password: str) -> str:
    """
    Convert a plain-text password into a secure hash.

    Args:
        password (str): User's plain-text password.

    Returns:
        str: Hashed password.
    """
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain-text password against the stored hash.

    Args:
        password (str): Password entered by the user.
        password_hash (str): Hashed password stored in the database.

    Returns:
        bool: True if password matches, False otherwise.
    """
    return check_password_hash(password_hash, password)