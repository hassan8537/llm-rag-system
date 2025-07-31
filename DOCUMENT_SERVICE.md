# Document Service Implementation

## Overview
A comprehensive document processing service that handles PDF files from S3, extracts text content, creates embeddings page by page, and provides full CRUD operations with database management.

## Features

### Core Functionality
- **PDF Processing**: Download and parse PDF files from S3
- **Text Extraction**: Extract full text content from PDF documents
- **Embedding Generation**: Create OpenAI embeddings for each page
- **Database Management**: Store documents and embeddings with relationships
- **S3 Integration**: Complete integration with AWS S3 for file management

### API Endpoints
```
POST   /api/documents/process     - Process uploaded PDF document
GET    /api/documents            - Get all documents with metadata
GET    /api/documents/:id        - Get document by ID with embeddings
GET    /api/documents/:id/status - Get document processing status
DELETE /api/documents/:id        - Delete document and all embeddings
```

## Architecture

### Models
1. **Document Model** (`src/models/document.model.ts`)
   - Stores document metadata, S3 key, processing status
   - Tracks file size, content type, extracted text
   - Has one-to-many relationship with embeddings

2. **Embedding Model** (`src/models/embedding.model.ts`)
   - Stores page-specific embeddings
   - Contains page content, embedding vectors, token counts
   - Foreign key relationship to documents

### Services
1. **DocumentService** (`src/services/document.service.ts`)
   - Core business logic for document processing
   - Integrates S3Service and EmbeddingService
   - Handles PDF parsing and embedding generation

2. **EmbeddingService** (existing)
   - OpenAI API integration for embedding generation
   - Uses text-embedding-ada-002 model

3. **S3Service** (existing)
   - AWS S3 operations for file management
   - Pre-signed URLs, file deletion, downloads

### Controllers & Routes
- **DocumentController**: Request handling with proper error responses
- **Document Routes**: Protected endpoints requiring authentication
- **Postman Collection**: Comprehensive API testing suite

## Database Schema

### Documents Table
```sql
- id (PRIMARY KEY)
- name (VARCHAR, NOT NULL)
- s3Key (VARCHAR, UNIQUE, NOT NULL)
- contentType (VARCHAR, NOT NULL)
- fileSize (BIGINT, NULLABLE)
- totalPages (INTEGER, DEFAULT 0)
- processingStatus (ENUM: pending, processing, completed, failed)
- processingError (TEXT, NULLABLE)
- createdAt, updatedAt
```

**Note**: The `extractedText` field has been removed to avoid data duplication. Full document text can be reconstructed from page content stored in the embeddings table.

### Embeddings Table
```sql
- id (PRIMARY KEY)
- documentId (FOREIGN KEY to documents)
- pageNumber (INTEGER, NOT NULL)
- content (TEXT, NOT NULL)
- embedding (JSON, NOT NULL) - OpenAI embedding vector
- tokenCount (INTEGER, NOT NULL)
- createdAt, updatedAt
```

## Usage Workflow

### 1. Upload Document
```javascript
// Get S3 upload URL
POST /api/s3/upload-url
{
  "fileName": "document.pdf",
  "contentType": "application/pdf"
}

// Upload file to S3 using returned URL
// (External S3 upload using pre-signed URL)
```

### 2. Process Document
```javascript
POST /api/documents/process
{
  "s3Key": "uploads/1234-document.pdf",
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "fileSize": 12345
}

Response:
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "name": "document.pdf",
      "s3Key": "uploads/1234-document.pdf",
      "processingStatus": "completed",
      "totalPages": 5,
      "embeddingsCreated": 5
    }
  }
}
```

### 3. Retrieve Documents
```javascript
// Get all documents
GET /api/documents

// Get specific document
GET /api/documents/1

// Check processing status
GET /api/documents/1/status
```

### 4. Delete Document
```javascript
DELETE /api/documents/1

Response:
{
  "success": true,
  "data": {
    "message": "Document 'document.pdf' deleted successfully",
    "details": {
      "deletedEmbeddings": 5,
      "s3Deleted": true
    }
  }
}
```

## Error Handling
- Validates PDF content type
- Handles S3 download failures
- Manages OpenAI API errors
- Proper error responses with status codes
- Database transaction safety

## Security Features
- All endpoints require authentication
- JWT token validation
- Protected file access
- Input validation and sanitization

## Performance Considerations
- Efficient page-based text splitting
- Batch embedding generation
- Database indexes on foreign keys
- Async processing patterns
- Proper error recovery
- **Optimized storage**: Text stored only in embeddings table to eliminate duplication

## Testing
Complete Postman collection with:
- Authentication flow
- S3 file operations
- Document processing tests
- Status checking
- Cleanup operations
- Automated variable management

## Dependencies
- `pdf-parse`: PDF text extraction
- `@aws-sdk/client-s3`: S3 operations
- `openai`: Embedding generation
- `sequelize-typescript`: Database ORM
- `express`: REST API framework

## Configuration
Required environment variables:
```
AWS_S3_BUCKET_NAME
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
OPENAI_API_KEY
DATABASE_URL
```

## Future Enhancements
- OCR support for scanned PDFs
- Chunking strategies for large documents
- Vector similarity search
- Document version management
- Parallel processing for large files
- Metadata extraction (author, title, etc.)
