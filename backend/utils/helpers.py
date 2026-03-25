"""
Helper utilities for the AI Document Redaction Backend
"""

import os
import json
from datetime import datetime
from typing import Any, Dict


def get_timestamp() -> str:
    """
    Get current timestamp as ISO format string
    
    Returns:
        Current timestamp in ISO format
    """
    return datetime.utcnow().isoformat()


def format_response(success: bool, message: str, data: Any = None) -> Dict:
    """
    Format a standard API response
    
    Args:
        success: Whether the operation was successful
        message: Response message
        data: Optional data to include
    
    Returns:
        Formatted response dictionary
    """
    response = {
        "success": success,
        "message": message,
        "timestamp": get_timestamp()
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """
    Validate if a file has an allowed extension
    
    Args:
        filename: The filename to validate
        allowed_extensions: List of allowed extensions (e.g., ['.txt', '.pdf'])
    
    Returns:
        True if valid, False otherwise
    """
    _, ext = os.path.splitext(filename)
    return ext.lower() in allowed_extensions


def load_json_config(config_path: str) -> Dict:
    """
    Load configuration from a JSON file
    
    Args:
        config_path: Path to the JSON config file
    
    Returns:
        Configuration dictionary
    """
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def save_json_config(config: Dict, config_path: str) -> bool:
    """
    Save configuration to a JSON file
    
    Args:
        config: Configuration dictionary to save
        config_path: Path to save the JSON config file
    
    Returns:
        True if successful, False otherwise
    """
    try:
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        return True
    except Exception:
        return False


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename by removing potentially dangerous characters
    
    Args:
        filename: The filename to sanitize
    
    Returns:
        Sanitized filename
    """
    # Remove path separators and potentially dangerous characters
    filename = os.path.basename(filename)
    # Replace spaces with underscores
    filename = filename.replace(" ", "_")
    # Remove any non-alphanumeric characters except dots and underscores
    allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
    return ''.join(c for c in filename if c in allowed_chars)


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format
    
    Args:
        size_bytes: Size in bytes
    
    Returns:
        Formatted size string (e.g., "1.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


class Config:
    """
    Configuration manager for the application
    """
    
    DEFAULT_CONFIG = {
        "app_name": "AI Document Redaction API",
        "version": "1.0.0",
        "max_upload_size": 10 * 1024 * 1024,  # 10 MB
        "allowed_extensions": [".txt", ".pdf", ".doc", ".docx"],
        "redaction_replacement": "[REDACTED]",
        "enable_ner": False,  # Set to True to enable HuggingFace NER
    }
    
    def __init__(self, config_path: str = None):
        """
        Initialize configuration
        
        Args:
            config_path: Optional path to config file
        """
        self.config = self.DEFAULT_CONFIG.copy()
        
        if config_path:
            loaded_config = load_json_config(config_path)
            self.config.update(loaded_config)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set a configuration value"""
        self.config[key] = value
    
    def save(self, config_path: str) -> bool:
        """Save configuration to file"""
        return save_json_config(self.config, config_path)

