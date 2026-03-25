"""
Authentication Service
Handles user registration and login
"""

import hashlib
import secrets
from typing import Dict, Optional


class AuthService:
    """
    Authentication service for user management
    Note: This is a simple implementation. In production, use a proper database
    and secure password hashing (e.g., bcrypt)
    """
    
    def __init__(self):
        # In-memory storage for demo purposes
        # Replace with a proper database in production
        self.users: Dict[str, dict] = {}
    
    def _hash_password(self, password: str) -> str:
        """Simple password hashing"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _generate_token(self) -> str:
        """Generate a random token"""
        return secrets.token_urlsafe(32)
    
    def register(self, username: str, email: str, password: str) -> Dict:
        """
        Register a new user
        
        Args:
            username: The username
            email: The user's email
            password: The user's password
        
        Returns:
            Dict with success status and message
        """
        # Check if username already exists
        if username in self.users:
            return {
                "success": False,
                "message": "Username already exists"
            }
        
        # Check if email already exists
        for user in self.users.values():
            if user.get("email") == email:
                return {
                    "success": False,
                    "message": "Email already registered"
                }
        
        # Create new user
        self.users[username] = {
            "username": username,
            "email": email,
            "password_hash": self._hash_password(password),
            "token": self._generate_token()
        }
        
        return {
            "success": True,
            "message": "User registered successfully",
            "token": self.users[username]["token"]
        }
    
    def login(self, username: str, password: str) -> Dict:
        """
        Authenticate a user
        
        Args:
            username: The username
            password: The user's password
        
        Returns:
            Dict with success status, message, and token
        """
        # Check if user exists
        if username not in self.users:
            return {
                "success": False,
                "message": "Invalid username or password",
                "token": None
            }
        
        # Verify password
        user = self.users[username]
        if user["password_hash"] != self._hash_password(password):
            return {
                "success": False,
                "message": "Invalid username or password",
                "token": None
            }
        
        # Generate new token on login
        user["token"] = self._generate_token()
        
        return {
            "success": True,
            "message": "Login successful",
            "token": user["token"]
        }
    
    def verify_token(self, token: str) -> Optional[dict]:
        """
        Verify a token and return user info
        
        Args:
            token: The token to verify
        
        Returns:
            User info if token is valid, None otherwise
        """
        for user in self.users.values():
            if user.get("token") == token:
                return {
                    "username": user["username"],
                    "email": user["email"]
                }
        return None

