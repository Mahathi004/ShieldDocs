const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const token = jwt.sign({ user: { id: 7 } }, JWT_SECRET, { expiresIn: '1h' });

const filePath = 'c:\\Users\\Welcome\\OneDrive\\Documents\\shielddocs\\frontend\\test_resume.pdf';
const stats = fs.statSync(filePath);
const fileSizeInBytes = stats.size;

const boundary = '--------------------------' + Math.floor(Math.random() * 1000000000);

async function test() {
    console.log('--- Phase 1: Upload ---');
    const fileContent = fs.readFileSync(filePath);
    
    let body = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="document"; filename="test_resume.pdf"\r\n`),
        Buffer.from(`Content-Type: application/pdf\r\n\r\n`),
        fileContent,
        Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await fetch('http://localhost:5000/api/documents/upload-file', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
    });

    const uploadData = await uploadRes.json();
    console.log('Upload Response:', uploadRes.status, uploadData);

    if (!uploadRes.ok) return;

    const currentFilePath = uploadData.file_path;

    console.log('--- Phase 2: Redact ---');
    const redactRes = await fetch('http://localhost:5000/api/documents/apply-redactions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file_path: currentFilePath,
            redactions: [{ page: 1, x1: 100, y1: 100, x2: 300, y2: 150, type: 'redact' }],
            rotation: 0
        })
    });

    const redactData = await redactRes.json();
    console.log('Redaction Response:', redactRes.status, redactData);

    if (redactRes.ok && redactData.redacted_file) {
        console.log('SUCCESS: Redacted file created at', redactData.redacted_file);
        
        console.log('--- Phase 3: Verify Static Serving ---');
        const verifyRes = await fetch(`http://localhost:5000/${redactData.redacted_file}`);
        console.log('Static Serving Response Status:', verifyRes.status);
        if (verifyRes.ok) {
            console.log('SUCCESS: Static file is accessible!');
        } else {
            console.log('FAILURE: Static file not found!');
        }
    }
}

test().catch(console.error);
