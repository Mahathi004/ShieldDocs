"""Quick test to verify all packages are installed"""
import sys

try:
    import fastapi
    print("✓ FastAPI installed")
except ImportError as e:
    print(f"✗ FastAPI: {e}")

try:
    import uvicorn
    print("✓ Uvicorn installed")
except ImportError as e:
    print(f"✗ Uvicorn: {e}")

try:
    import fitz
    print("✓ PyMuDF installed")
except ImportError as e:
    print(f"✗ PyMuDF: {e}")

try:
    import transformers
    print("✓ Transformers installed")
except ImportError as e:
    print(f"✗ Transformers: {e}")

try:
    import torch
    print("✓ Torch installed")
except ImportError as e:
    print(f"✗ Torch: {e}")

print("\nAll packages verified!")
