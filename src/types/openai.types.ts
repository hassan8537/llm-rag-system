export interface EmbeddingResponse {
  success: boolean;
  data?: number[];
  message: string;
  error?: string;
}

export interface LLMResponse {
  success: boolean;
  data?: string;
  message: string;
  error?: string;
}

export interface StreamingLLMResponse {
  success: boolean;
  data?: AsyncGenerator<string>;
  message: string;
  error?: string;
}

export interface OpenAIConfig {
  apiEndpoint?: string;
  modelName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateResponseOptions {
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  messages?: ChatMessage[];
}
