import { openaiClient } from '../config/openai';

/**
 * EmbeddingService - Service to generate embeddings using OpenAI API
 * Direct TypeScript equivalent of the JavaScript EmbeddingService class
 */
export class EmbeddingService {
  private readonly apiEndpoint: string;
  private readonly apiKey: string;

  /**
   * Initialize the EmbeddingService
   * @param apiEndpoint - OpenAI API endpoint (optional)
   */
  constructor(apiEndpoint: string = "https://api.openai.com/v1/embeddings") {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
  }

  /**
   * Fetch the embedding for a given text using OpenAI's text-embedding-ada-002 model
   * @param text - The text to generate embedding for
   * @returns The embedding vector
   * @throws Error - If embedding generation fails
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
      });

      return response.data[0].embedding;
    } catch (error: any) {
      console.error(`Error generating embedding: ${error.message}`);
      throw error;
    }
  }
}
