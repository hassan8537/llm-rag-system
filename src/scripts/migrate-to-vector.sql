-- Migration script to convert embedding column from TEXT/JSON to VECTOR
-- Run this script in your PostgreSQL database

-- Step 1: Create a temporary column with VECTOR type
ALTER TABLE embeddings ADD COLUMN embedding_temp VECTOR(1536);

-- Step 2: Convert existing data from TEXT/JSON to VECTOR
-- If your current embedding column stores JSON arrays as text:
UPDATE embeddings 
SET embedding_temp = embedding::text::vector 
WHERE embedding IS NOT NULL;

-- Or if your embedding column stores actual JSON:
-- UPDATE embeddings 
-- SET embedding_temp = embedding::vector 
-- WHERE embedding IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE embeddings DROP COLUMN embedding;

-- Step 4: Rename the new column
ALTER TABLE embeddings RENAME COLUMN embedding_temp TO embedding;

-- Step 5: Add NOT NULL constraint
ALTER TABLE embeddings ALTER COLUMN embedding SET NOT NULL;

-- Step 6: Create an index for better performance (optional but recommended)
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
