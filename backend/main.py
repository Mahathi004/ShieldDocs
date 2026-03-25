"""
AI Document Redaction Backend
FastAPI server for text and document redaction with PII detection
"""

from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.auth_service import AuthService
from services.redaction_service import RedactionService
from services.file_service import FileService


app = FastAPI(
    title="AI Document Redaction API",
    description="Backend API for AI-powered document redaction with PII detection",
    version="1.0.0"
)

# Mount static folder
app.mount("/redacted_output", StaticFiles(directory="redacted_output"), name="redacted_output")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
auth_service = AuthService()
redaction_service = RedactionService()
file_service = FileService()



# Pydantic Models
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class RedactTextRequest(BaseModel):
    text: str
    mode: Optional[str] = "redacted"
    use_ner: Optional[bool] = True


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None


class RedactTextResponse(BaseModel):
    original_text: str
    redacted_text: str
    entities_detected: list


class UploadFileResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    redacted_text: Optional[str] = None
    entities_detected: Optional[list] = None


class UploadPdfResponse(BaseModel):
    file_path: str


# Test Endpoint
@app.get("/")
async def root():
    return {"message": "Backend running"}


# Authentication Endpoints
@app.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    result = auth_service.register(request.username, request.email, request.password)
    return AuthResponse(**result)


@app.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    result = auth_service.login(request.username, request.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return AuthResponse(**result)


# Redaction Endpoints
@app.post("/redact-text", response_model=RedactTextResponse)
async def redact_text(request: RedactTextRequest):
    valid_modes = ["redacted", "mask", "tag"]
    mode = request.mode if request.mode in valid_modes else "redacted"
    use_ner = request.use_ner if request.use_ner is not None else False
    result = redaction_service.redact_text(request.text, mode=mode, use_ner=use_ner)
    return RedactTextResponse(**result)

@app.post("/upload-pdf", response_model=UploadPdfResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file_path = await file_service.save_upload(file)
    return UploadPdfResponse(file_path=file_path)


@app.post("/apply-redactions")
async def apply_redactions(request: dict):
    """
    Apply PDF redactions - JSON body direct dict
    """
    file_path = request["file_path"]
    redactions_list = request["redactions"]
    rotation = request.get("rotation", 0)
    
    try:
        redacted_filename = redaction_service.apply_pdf_redactions(file_path, redactions_list, rotation)
        return {"redacted_file": f"redacted_output/{redacted_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redaction failed: {str(e)}")


@app.get("/preview/{file_path:path}")
async def preview_redacted(file_path: str):
    """Serve redacted PDF for preview"""
    from fastapi.responses import StreamingResponse
    import os
    
    if file_path.startswith("redacted_output/"):
        full_path = file_path
    elif file_path.startswith("redacted_output\\"):
        full_path = file_path
    else:
        full_path = os.path.join("redacted_output", file_path)
        
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Redacted file not found")
    
    def iter_file():
        with open(full_path, mode="rb") as file:
            yield from file
    
    return StreamingResponse(iter_file(), media_type="application/pdf")


@app.get("/download/{file_path:path}")
async def download_redacted(file_path: str):
    """Download redacted PDF"""
    from fastapi.responses import FileResponse
    import os
    
    if file_path.startswith("redacted_output/"):
        full_path = file_path
    elif file_path.startswith("redacted_output\\"):
        full_path = file_path
    else:
        full_path = os.path.join("redacted_output", file_path)
        
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Redacted file not found")
    
    filename = os.path.basename(full_path)
    return FileResponse(
        full_path,
        filename=filename,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
