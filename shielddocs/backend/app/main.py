import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pdf2image import convert_from_bytes
from PIL import Image
import io
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import List, Optional
import json
import os
from pydantic import BaseModel


# Security
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class User(BaseModel):
    id: int
    email: str
    name: str
    role: str = "user"

class Document(BaseModel):
    id: int
    name: str
    type: str
    size: int
    uploaded_by: int
    uploaded_at: datetime
    is_encrypted: bool = True
    tags: List[str] = []

class DocumentUploadResponse(BaseModel):
    id: int
    name: str
    type: str
    size: int
    extracted_text: Optional[str] = None
    tags: List[str] = []

# Mock database
users_db = {
    1: {"id": 1, "email": "admin@shielddocs.com", "name": "Admin User", "role": "admin"},
    2: {"id": 2, "email": "user@shielddocs.com", "name": "Regular User", "role": "user"}
}

documents_db = {}

# Security
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

app = FastAPI(
    title="ShieldDocs API",
    description="Secure Document Management API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ShieldDocs API - Secure Document Management"}

@app.post("/auth/login")
async def login(email: str, password: str):
    # Mock authentication
    if email == "admin@shielddocs.com" and password == "admin123":
        user = users_db[1]
        access_token = create_access_token(data={"sub": str(user["id"])})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    elif email == "user@shielddocs.com" and password == "user123":
        user = users_db[2]
        access_token = create_access_token(data={"sub": str(user["id"])})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/auth/register")
async def register(email: str, password: str, name: str):
    # Mock registration
    user_id = len(users_db) + 1
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "id": user_id,
        "email": email,
        "name": name,
        "role": "user"
    }
    
    users_db[user_id] = new_user
    
    access_token = create_access_token(data={"sub": str(user_id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.get("/users/me")
async def get_current_user(user_id: int = Depends(verify_token)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    user_id: int = Depends(verify_token)
):
    filename = file.filename.lower()
    file_content = await file.read()
    
    # Validate file type
    allowed_types = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']
    if not any(filename.endswith(ext) for ext in allowed_types):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    # Validate file size (50MB limit)
    if len(file_content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # Generate document ID
    doc_id = len(documents_db) + 1
    
    # Extract text based on file type
    extracted_text = None
    if filename.endswith(".pdf"):
        try:
            pages = convert_from_bytes(file_content, dpi=200)
            results = []
            for i, page in enumerate(pages):
                text = pytesseract.image_to_string(page)
                results.append({"page": i+1, "text": text})
            extracted_text = json.dumps(results)
        except Exception as e:
            extracted_text = f"Error extracting text: {str(e)}"
    
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        try:
            img = Image.open(io.BytesIO(file_content))
            extracted_text = pytesseract.image_to_string(img)
        except Exception as e:
            extracted_text = f"Error extracting text: {str(e)}"
    
    # Create document record
    document = {
        "id": doc_id,
        "name": file.filename,
        "type": filename.split('.')[-1].upper(),
        "size": len(file_content),
        "uploaded_by": user_id,
        "uploaded_at": datetime.utcnow(),
        "is_encrypted": True,
        "extracted_text": extracted_text,
        "tags": []
    }
    
    documents_db[doc_id] = document
    
    return DocumentUploadResponse(
        id=doc_id,
        name=file.filename,
        type=document["type"],
        size=len(file_content),
        extracted_text=extracted_text,
        tags=[]
    )

@app.get("/documents/")
async def get_documents(user_id: int = Depends(verify_token)):
    # Return documents for the current user
    user_documents = [
        doc for doc in documents_db.values() 
        if doc["uploaded_by"] == user_id
    ]
    return user_documents

@app.get("/documents/{document_id}")
async def get_document(document_id: int, user_id: int = Depends(verify_token)):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents_db[document_id]
    if document["uploaded_by"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return document

@app.delete("/documents/{document_id}")
async def delete_document(document_id: int, user_id: int = Depends(verify_token)):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents_db[document_id]
    if document["uploaded_by"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    del documents_db[document_id]
    return {"message": "Document deleted successfully"}

@app.get("/analytics/")
async def get_analytics(user_id: int = Depends(verify_token)):
    user_documents = [
        doc for doc in documents_db.values() 
        if doc["uploaded_by"] == user_id
    ]
    
    # Calculate analytics
    total_documents = len(user_documents)
    total_size = sum(doc["size"] for doc in user_documents)
    
    # Document types distribution
    type_counts = {}
    for doc in user_documents:
        doc_type = doc["type"]
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
    
    # Recent activity
    recent_uploads = sorted(
        user_documents, 
        key=lambda x: x["uploaded_at"], 
        reverse=True
    )[:5]
    
    return {
        "total_documents": total_documents,
        "total_size": total_size,
        "type_distribution": type_counts,
        "recent_uploads": recent_uploads,
        "upload_trend": [
            {"month": "Jan", "count": 45},
            {"month": "Feb", "count": 52},
            {"month": "Mar", "count": 48},
            {"month": "Apr", "count": 61},
            {"month": "May", "count": 55},
            {"month": "Jun", "count": 67},
        ]
    }

@app.post("/documents/{document_id}/share")
async def share_document(
    document_id: int,
    user_emails: List[str],
    permissions: str = "view",
    user_id: int = Depends(verify_token)
):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents_db[document_id]
    if document["uploaded_by"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mock sharing functionality
    return {
        "message": f"Document shared with {len(user_emails)} users",
        "shared_with": user_emails,
        "permissions": permissions
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
