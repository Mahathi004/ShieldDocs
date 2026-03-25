-- Create Database
-- Note: You may need to run this separately from the table creation depending on your SQL client.
CREATE DATABASE shielddocs;

-- Connect to the database (psql specific command)
\c shielddocs;

-- 1. users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('text', 'pdf')),
    content TEXT,
    file_path TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_content_or_filepath CHECK (
        (content IS NOT NULL AND file_path IS NULL) OR 
        (content IS NULL AND file_path IS NOT NULL)
    )
);

-- 3. activity_logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    action VARCHAR(50) CHECK (action IN ('login', 'save', 'upload', 'delete', 'restore')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
