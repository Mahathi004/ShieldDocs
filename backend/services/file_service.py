"""
File Service
Handles file upload and text extraction from documents
"""

import os
import uuid
from typing import Optional
from fastapi import UploadFile


class FileService:
    """
    Service for handling file uploads and text extraction
    """
    
    def __init__(self, upload_dir: str = "uploads"):
        """
        Initialize the file service
        
        Args:
            upload_dir: Directory to save uploaded files
        """
        self.upload_dir = upload_dir
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_upload(self, file: UploadFile) -> str:
        """
        Save an uploaded file to disk
        
        Args:
            file: The uploaded file
        
        Returns:
            Path to the saved file
        """
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.upload_dir, unique_filename)
        
        # Save the file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return path with forward slashes for API consistency
        return file_path.replace("\\", "/")
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from a file based on its extension
        
        Args:
            file_path: Path to the file
        
        Returns:
            Extracted text from the file
        """
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == ".txt":
            return self._extract_from_txt(file_path)
        elif file_extension == ".pdf":
            return self._extract_from_pdf(file_path)
        elif file_extension in [".doc", ".docx"]:
            return self._extract_from_docx(file_path)
        else:
            # Default: try to read as text
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read()
            except:
                return f"Unsupported file type: {file_extension}"
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from a plain text file"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, "r", encoding="latin-1") as f:
                return f.read()
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """
        Extract text from a PDF file using PyMuDF
        
        Args:
            file_path: Path to the PDF file
        
        Returns:
            Extracted text from the PDF
        """
        try:
            import fitz  # PyMuDF
            
            doc = fitz.open(file_path)
            text = ""
            
            for page in doc:
                text += page.get_text()
            
            doc.close()
            return text
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"
    
    def _extract_from_docx(self, file_path: str) -> str:
        """
        Extract text from a DOCX file
        
        Args:
            file_path: Path to the DOCX file
        
        Returns:
            Extracted text from the DOCX
        """
        try:
            # Try using python-docx
            import docx
            
            doc = docx.Document(file_path)
            text = ""
            
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text
        except ImportError:
            return "Error: python-docx not installed. Cannot extract DOCX content."
        except Exception as e:
            return f"Error extracting DOCX: {str(e)}"
    
    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from disk
        
        Args:
            file_path: Path to the file to delete
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    def get_supported_extensions(self) -> list:
        """
        Get list of supported file extensions
        
        Returns:
            List of supported file extensions
        """
        return [".txt", ".pdf", ".doc", ".docx"]

