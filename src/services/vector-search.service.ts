import { Embedding } from '../models/embedding.model';
import { Document } from '../models/document.model';
import { EmbeddingService } from './embedding.service';

export interface VectorSearchResult {
  content: string;
  similarity: number;
  documentId: number;
  pageNumber: number;
  documentName?: string;
}

export interface SearchContext {
  query: string;
  results: VectorSearchResult[];
  totalResults: number;
}

export class VectorSearchService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Create embedding for a query
   * @param query - The search query
   * @returns Embedding vector
   */
  async createQueryEmbedding(query: string): Promise<number[]> {
    try {
      const embedding = await this.embeddingService.getEmbedding(query);
      return embedding;
    } catch (error: any) {
      console.error('Error creating query embedding:', error);
      throw new Error(`Failed to create query embedding: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param a - First vector
   * @param b - Second vector
   * @returns Similarity score (0-1)
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Search for similar embeddings using vector similarity
   * @param queryEmbedding - The query embedding vector
   * @param limit - Maximum number of results to return
   * @param threshold - Minimum similarity threshold (0-1)
   * @param userId - Optional user ID to filter documents by user
   * @returns Array of similar content with similarity scores
   */
  async searchSimilarEmbeddings(
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.7,
    userId?: string
  ): Promise<VectorSearchResult[]> {
    try {
      // Get all embeddings with their associated documents
      const whereClause: any = {};
      const includeClause: any = [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'name', 'userId'],
          where: userId ? { userId } : undefined,
        }
      ];

      const embeddings = await Embedding.findAll({
        where: whereClause,
        include: includeClause,
        attributes: ['id', 'documentId', 'pageNumber', 'content', 'embedding'],
      });

      // Calculate similarities and filter by threshold
      const results: VectorSearchResult[] = [];

      for (const embedding of embeddings) {
        try {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
          
          if (similarity >= threshold) {
            results.push({
              content: embedding.content,
              similarity,
              documentId: embedding.documentId,
              pageNumber: embedding.pageNumber,
              documentName: (embedding as any).document?.name,
            });
          }
        } catch (error) {
          console.warn(`Error calculating similarity for embedding ${embedding.id}:`, error);
          continue;
        }
      }

      // Sort by similarity (highest first) and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error: any) {
      console.error('Error searching similar embeddings:', error);
      throw new Error(`Failed to search embeddings: ${error.message}`);
    }
  }

  /**
   * Perform a complete vector search with query embedding creation
   * @param query - The search query text
   * @param limit - Maximum number of results
   * @param threshold - Minimum similarity threshold
   * @param userId - Optional user ID filter
   * @returns Search context with query and results
   */
  async performVectorSearch(
    query: string,
    limit: number = 10,
    threshold: number = 0.7,
    userId?: string
  ): Promise<SearchContext> {
    try {
      // Create embedding for the query
      const queryEmbedding = await this.createQueryEmbedding(query);

      // Search for similar embeddings
      const results = await this.searchSimilarEmbeddings(
        queryEmbedding,
        limit,
        threshold,
        userId
      );

      return {
        query,
        results,
        totalResults: results.length,
      };
    } catch (error: any) {
      console.error('Error performing vector search:', error);
      throw new Error(`Failed to perform vector search: ${error.message}`);
    }
  }

  /**
   * Format search results into context for LLM
   * @param searchResults - Vector search results
   * @returns Formatted context string
   */
  formatContextForLLM(searchResults: VectorSearchResult[]): string {
    if (searchResults.length === 0) {
      return "No relevant context found in the documents.";
    }

    let context = "Based on the following relevant information from the documents:\n\n";

    searchResults.forEach((result, index) => {
      context += `Document: ${result.documentName || 'Unknown'} (Page ${result.pageNumber})\n`;
      context += `Content: ${result.content}\n`;
      context += `Relevance: ${(result.similarity * 100).toFixed(1)}%\n\n`;
    });

    context += "Please provide a comprehensive answer based on this context.";

    return context;
  }

  /**
   * Get search statistics
   * @param userId - Optional user ID filter
   * @returns Search statistics
   */
  async getSearchStats(userId?: string): Promise<{
    totalDocuments: number;
    totalEmbeddings: number;
    averageEmbeddingsPerDocument: number;
  }> {
    try {
      const documentWhere = userId ? { userId } : {};
      
      const totalDocuments = await Document.count({
        where: documentWhere,
      });

      const totalEmbeddings = await Embedding.count({
        include: [
          {
            model: Document,
            as: 'document',
            where: documentWhere,
            attributes: [],
          }
        ],
      });

      const averageEmbeddingsPerDocument = totalDocuments > 0 
        ? Math.round((totalEmbeddings / totalDocuments) * 100) / 100 
        : 0;

      return {
        totalDocuments,
        totalEmbeddings,
        averageEmbeddingsPerDocument,
      };
    } catch (error: any) {
      console.error('Error getting search stats:', error);
      throw new Error(`Failed to get search stats: ${error.message}`);
    }
  }
}
