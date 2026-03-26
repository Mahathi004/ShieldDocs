# ShieldDocs

AI-Powered Document Redaction with PII Detection.

## Project Structure

- `frontend/`: Static HTML/JS frontend.
- `backend/`: Node.js (main API) and Python/FastAPI (AI engine) servers.
- `uploads/`: Temporary storage for uploaded documents.
- `redacted_output/`: Storage for processed (redacted) documents.

## Local Setup

Please follow the detailed instructions in the [Local Setup Guide](file:///C:/Users/Welcome/.gemini/antigravity/brain/ad077ee1-3bd1-4e5d-85a8-11a034d60350/implementation_plan.md) to run the application on your computer.

### Quick Start

1. **Database**: Create a PostgreSQL database named `shielddocs` and run `backend/database.sql`.
2. **Node.js Backend**: `cd backend && npm install && node server.js`.
3. **AI Backend**: `cd backend && pip install -r requirements.txt && python main.py`.
4. **Access**: Visit `http://localhost:5000` in your browser.

## Features

- **Text Redaction**: Mask or remove PII from plain text.
- **PDF Redaction**: Highlight and redact sensitive information in PDF documents.
- **Telemetry**: Real-time activity logs and dashboard analytics.
- **Security**: Robust authentication and CSP-compliant headers.
