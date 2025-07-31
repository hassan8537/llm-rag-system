import { openaiClient } from '../config/openai';

const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * LLMService - Service to generate responses using OpenAI API
 * Direct TypeScript equivalent of the JavaScript LLMService class
 */
export class LLMService {
  private readonly modelName: string;
  private readonly apiKey: string;

  /**
   * Initialize the LLMService
   * @param modelName - OpenAI model name (default: "gpt-4-turbo")
   */
  constructor(modelName: string = "gpt-4-turbo") {
    this.modelName = modelName;
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
  }

  /**
   * Generate response from OpenAI API
   * @param prompt - The prompt to send to the model
   * @param stream - Whether to stream the response (default: false)
   * @returns Promise containing response string or stream generator
   * @throws Error - If response generation fails
   */
  async generateResponse(prompt: string, stream: boolean = false): Promise<string | AsyncGenerator<string>> {
    const payload = {
      model: this.modelName,
      messages: [
        {
          role: "user" as const,
          content: prompt
        }
      ],
      stream: stream,
      max_tokens: 1000,
      temperature: 0.7
    };

    if (stream) {
      return this._handleStreamingResponse(payload);
    } else {
      return this._handleNonStreamingResponse(payload);
    }
  }

  /**
   * Handle streaming response from OpenAI API
   * @param payload - Request payload
   * @returns Stream generator
   * @private
   */
  private async* _handleStreamingResponse(payload: any): AsyncGenerator<string> {
    try {
      const stream = await openaiClient.chat.completions.create({
        ...payload,
        stream: true
      }) as any;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield delta.content;
        }
      }
    } catch (error: any) {
      console.error(`Error in streaming response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle non-streaming response from OpenAI API
   * @param payload - Request payload
   * @returns Promise containing response content
   * @private
   */
  private async _handleNonStreamingResponse(payload: any): Promise<string> {
    try {
      const response = await openaiClient.chat.completions.create(payload);
      
      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content || '';
      } else {
        throw new Error("No response received from OpenAI API");
      }
    } catch (error: any) {
      console.error(`Error in non-streaming response: ${error.message}`);
      throw error;
    }
  }
}
