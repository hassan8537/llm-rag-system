# OpenAI Services Documentation

This document describes the OpenAI integration services for embeddings and language model interactions.

## Overview

The Motor Backend API now includes two main OpenAI services:
- **EmbeddingService**: Generate embeddings for text similarity and vector operations
- **LLMService**: Generate text responses using GPT models

Both services include comprehensive health monitoring to ensure API connectivity and configuration validation.

## Health Monitoring

### Health Check Endpoints
- **LLM Service**: `GET /api/health/llm`
- **Embedding Service**: `GET /api/health/embedding`
- **Overall Status**: `GET /api/health/status`

### Health Criteria
- ✅ OPENAI_API_KEY configured and accessible
- ✅ Service initialization successful
- ✅ Model configuration valid
- ❌ Missing API key or configuration errors

### Integration with System Health
Both OpenAI services are monitored as part of the comprehensive system health check. Service status affects overall system health ratings.

For detailed health check documentation, see [HEALTH_CHECK_API.md](./HEALTH_CHECK_API.md).

## Services Architecture

### 📁 File Structure
```
src/
├── services/
│   ├── embedding.service.ts    # Embedding generation and similarity
│   └── llm.service.ts          # Language model responses
├── controllers/
│   ├── embedding.controller.ts # Embedding API endpoints
│   └── llm.controller.ts       # LLM API endpoints
├── routes/
│   ├── embedding.routes.ts     # Embedding route definitions
│   └── llm.routes.ts           # LLM route definitions
├── config/
│   └── openai.ts              # OpenAI client configuration
└── types/
    └── openai.types.ts        # TypeScript type definitions
```

## EmbeddingService

### Features
- Single text embedding generation
- Batch embedding processing
- Cosine similarity calculation
- Most similar embedding search
- Input validation and error handling

### API Endpoints

#### Generate Single Embedding
```http
POST /api/embeddings/generate
Content-Type: application/json

{
  "text": "Your text to embed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Embedding generated successfully",
  "data": [0.1234, -0.5678, ...], // 1536-dimensional vector
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Generate Batch Embeddings
```http
POST /api/embeddings/batch
Content-Type: application/json

{
  "texts": [
    "First text to embed",
    "Second text to embed",
    "Third text to embed"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch embeddings generated successfully",
  "data": [
    {
      "success": true,
      "data": [0.1234, -0.5678, ...],
      "message": "Embedding generated successfully"
    },
    // ... more results
  ],
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Calculate Similarity
```http
POST /api/embeddings/similarity
Content-Type: application/json

{
  "embedding1": [0.1234, -0.5678, ...],
  "embedding2": [0.9876, 0.5432, ...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Similarity calculated successfully",
  "data": {
    "similarity": 0.8234
  },
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Find Most Similar
```http
POST /api/embeddings/find-similar
Content-Type: application/json

{
  "queryEmbedding": [0.1234, -0.5678, ...],
  "embeddings": [
    [0.9876, 0.5432, ...],
    [0.3456, 0.7890, ...],
    [0.2468, 0.1357, ...]
  ],
  "topK": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Most similar embeddings found successfully",
  "data": [
    { "index": 0, "similarity": 0.9234 },
    { "index": 2, "similarity": 0.7456 }
  ],
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

## LLMService

### Features
- Single prompt response generation
- Streaming response support
- Conversation context handling
- Text summarization
- Question answering with context
- Configurable model parameters

### API Endpoints

#### Generate Response
```http
POST /api/llm/generate
Content-Type: application/json

{
  "prompt": "Explain quantum computing in simple terms",
  "maxTokens": 150,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": "Quantum computing is a revolutionary technology...",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Generate Streaming Response
```http
POST /api/llm/stream
Content-Type: application/json

{
  "prompt": "Write a short story about AI",
  "maxTokens": 200,
  "temperature": 0.8
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"start","message":"Streaming response initiated successfully"}

data: {"type":"chunk","content":"Once upon"}

data: {"type":"chunk","content":" a time"}

data: {"type":"chunk","content":", there was"}

...

data: {"type":"end","message":"Stream completed"}
```

#### Conversation Response
```http
POST /api/llm/conversation
Content-Type: application/json

{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant specializing in technology."
    },
    {
      "role": "user",
      "content": "What is machine learning?"
    },
    {
      "role": "assistant",
      "content": "Machine learning is a subset of artificial intelligence..."
    },
    {
      "role": "user",
      "content": "Can you give me an example?"
    }
  ],
  "maxTokens": 200,
  "temperature": 0.5
}
```

#### Generate Summary
```http
POST /api/llm/summary
Content-Type: application/json

{
  "text": "Very long text that needs to be summarized...",
  "maxLength": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Summary generated successfully",
  "data": {
    "summary": "The text discusses the importance of..."
  },
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Answer Question
```http
POST /api/llm/answer
Content-Type: application/json

{
  "question": "What is the main benefit mentioned?",
  "context": "The document describes various benefits of renewable energy, with reduced carbon emissions being the primary advantage..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer generated successfully",
  "data": {
    "answer": "Based on the provided context, the main benefit mentioned is reduced carbon emissions."
  },
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

## Configuration

### Environment Variables
Add to your `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Model Configuration
Default settings in services:
- **Embedding Model**: `text-embedding-ada-002`
- **LLM Model**: `gpt-4-turbo`
- **Default Max Tokens**: 1000
- **Default Temperature**: 0.7

## Error Handling

### Common Error Responses

#### Authentication Error
```json
{
  "success": false,
  "message": "Invalid OpenAI API key",
  "error": "Authentication failed",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "message": "OpenAI API rate limit exceeded",
  "error": "Too many requests",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### Validation Error
```json
{
  "success": false,
  "message": "Missing required fields: text",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

## Usage Examples

### JavaScript/TypeScript Client
```typescript
// Generate embedding
const embeddingResponse = await fetch('/api/embeddings/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello world' })
});

// Generate LLM response
const llmResponse = await fetch('/api/llm/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'Explain AI',
    maxTokens: 100,
    temperature: 0.7
  })
});

// Handle streaming response
const streamResponse = await fetch('/api/llm/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Tell me a story' })
});

const reader = streamResponse.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'chunk') {
        console.log(data.content);
      }
    }
  }
}
```

### cURL Examples
```bash
# Generate embedding
curl -X POST http://localhost:3000/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'

# Generate LLM response
curl -X POST http://localhost:3000/api/llm/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain AI", "maxTokens": 100}'

# Calculate similarity
curl -X POST http://localhost:3000/api/embeddings/similarity \
  -H "Content-Type: application/json" \
  -d '{"embedding1": [0.1, 0.2], "embedding2": [0.3, 0.4]}'
```

## Best Practices

### 1. Input Validation
- Always validate text length before sending to embedding service
- Limit batch embedding requests to reasonable sizes (≤100 items)
- Validate embedding dimensions match expected size (1536 for ada-002)

### 2. Error Handling
- Implement retry logic for rate limit errors
- Handle network timeouts gracefully
- Log errors for debugging and monitoring

### 3. Performance Optimization
- Cache embeddings for frequently used texts
- Use batch processing for multiple embeddings
- Implement request queuing for high-volume applications

### 4. Security
- Keep OpenAI API key secure and never expose in client-side code
- Implement rate limiting on your endpoints
- Validate and sanitize all input data

### 5. Cost Management
- Monitor token usage for LLM requests
- Use appropriate model sizes for your use case
- Implement usage tracking and limits

## Integration with Database

You can extend the services to work with your database:

```typescript
// Example: Store embeddings in database
const embeddingResult = await EmbeddingService.getEmbedding(text);
if (embeddingResult.success) {
  await Document.create({
    content: text,
    embedding: embeddingResult.data,
    // other fields...
  });
}

// Example: Semantic search using stored embeddings
const queryEmbedding = await EmbeddingService.getEmbedding(query);
const documents = await Document.findAll();
const similarities = documents.map(doc => ({
  document: doc,
  similarity: EmbeddingService.calculateCosineSimilarity(
    queryEmbedding.data,
    doc.embedding
  )
})).sort((a, b) => b.similarity - a.similarity);
```

This integration provides a powerful foundation for building AI-powered features in your Motor Backend API!
