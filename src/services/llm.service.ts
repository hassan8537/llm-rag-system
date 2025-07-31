import { openaiClient } from '../config/openai';

export interface LLMResponse {
  answer: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * LLMService - Service to generate responses using OpenAI API for RAG (Retrieval Augmented Generation)
 */
export class LLMService {
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  /**
   * Initialize the LLMService
   * @param model - OpenAI model name (default: "gpt-3.5-turbo")
   * @param maxTokens - Maximum tokens for response
   * @param temperature - Temperature for response generation
   */
  constructor(
    model: string = 'gpt-4-turbo',
    maxTokens: number = 1000,
    temperature: number = 0.6
  ) {
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
  }

  /**
   * Generate a response using the LLM with provided context from RAG
   * @param query - User's query
   * @param context - Context from vector search results
   * @param chatHistory - Previous chat messages (optional)
   * @returns LLM response with metadata
   */
  async generateResponse(
    query: string,
    context: string,
    chatHistory: ChatMessage[] = []
  ): Promise<LLMResponse> {
    try {
      // Prepare messages for the chat completion
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant that answers questions based on provided context. 
          Use the following context to answer the user's question. If the context doesn't contain 
          enough information to answer the question, say so clearly. Be concise but comprehensive.
          
          Context: ${context}`
        },
        ...chatHistory,
        {
          role: 'user',
          content: query
        }
      ];

      const response = await openaiClient.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false,
      });

      const choice = response.choices[0];
      
      return {
        answer: choice.message?.content || 'No response generated',
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        model: this.model,
        finishReason: choice.finish_reason || 'unknown',
      };

    } catch (error: any) {
      console.error('Error generating LLM response:', error);
      throw new Error(`Failed to generate LLM response: ${error.message}`);
    }
  }

  /**
   * Generate a title for a chat based on the query
   * @param query - User's query
   * @returns Generated title
   */
  async generateChatTitle(query: string): Promise<string> {
    try {
      const response = await openaiClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 50 characters) for a chat conversation based on the user\'s question. Be concise and capture the main topic.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
      });

      const title = response.choices[0].message?.content || 'New Chat';
      return title.length > 50 ? title.substring(0, 47) + '...' : title;

    } catch (error: any) {
      console.error('Error generating chat title:', error);
      // Fallback: create title from first few words of query
      const words = query.split(' ').slice(0, 6).join(' ');
      return words.length > 50 ? words.substring(0, 47) + '...' : words;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @param prompt - The prompt to send to the model
   * @param stream - Whether to stream the response (default: false)
   * @returns Promise containing response string
   * @deprecated Use generateResponse with context instead
   */
  async generateLegacyResponse(prompt: string, stream: boolean = false): Promise<string> {
    try {
      const response = await openaiClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      });

      return response.choices[0].message?.content || '';
    } catch (error: any) {
      console.error(`Error in legacy response: ${error.message}`);
      throw error;
    }
  }
}
