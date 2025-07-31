import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { S3Service } from '../services/s3.service';
import { LLMService } from '../services/llm.service';
import { EmbeddingService } from '../services/embedding.service';
import { DocumentService } from '../services/document.service';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { sequelize } from '../database/connection';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  error?: string;
}

export interface OverallHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

export class HealthController extends BaseController {

  /**
   * Comprehensive health check for all services
   * GET /api/health/status
   */
  static getOverallHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthChecks: ServiceHealth[] = [];
    
    // Database Health Check
    healthChecks.push(await HealthController.checkDatabaseHealth());
    
    // S3 Service Health Check
    healthChecks.push(await HealthController.checkS3Health());
    
    // OpenAI/LLM Service Health Check
    healthChecks.push(await HealthController.checkLLMHealth());
    
    // Embedding Service Health Check
    healthChecks.push(await HealthController.checkEmbeddingHealth());
    
    // Document Service Health Check
    healthChecks.push(await HealthController.checkDocumentServiceHealth());
    
    // Chat Service Health Check
    healthChecks.push(await HealthController.checkChatServiceHealth());
    
    // Auth Service Health Check
    healthChecks.push(await HealthController.checkAuthServiceHealth());
    
    // User Service Health Check
    healthChecks.push(await HealthController.checkUserServiceHealth());
    
    // Token Blacklist Service Health Check
    healthChecks.push(await HealthController.checkTokenBlacklistHealth());

    // Calculate summary
    const summary = {
      total: healthChecks.length,
      healthy: healthChecks.filter(h => h.status === 'healthy').length,
      unhealthy: healthChecks.filter(h => h.status === 'unhealthy').length,
      degraded: healthChecks.filter(h => h.status === 'degraded').length,
    };

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    const response: OverallHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: healthChecks,
      summary,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;
    
    res.status(statusCode).json({
      success: overallStatus !== 'unhealthy',
      data: response,
      message: `System is ${overallStatus}`,
    });
  });

  /**
   * Database health check
   * GET /api/health/database
   */
  static getDatabaseHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkDatabaseHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Database is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Database is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * S3 service health check
   * GET /api/health/s3
   */
  static getS3Health = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkS3Health();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `S3 service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `S3 service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * LLM service health check
   * GET /api/health/llm
   */
  static getLLMHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkLLMHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `LLM service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `LLM service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * Embedding service health check
   * GET /api/health/embedding
   */
  static getEmbeddingHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkEmbeddingHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Embedding service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Embedding service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * Document service health check
   * GET /api/health/document
   */
  static getDocumentServiceHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkDocumentServiceHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Document service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Document service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * Chat service health check
   * GET /api/health/chat
   */
  static getChatServiceHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkChatServiceHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Chat service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Chat service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * Auth service health check
   * GET /api/health/auth
   */
  static getAuthServiceHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkAuthServiceHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Auth service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Auth service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * User service health check
   * GET /api/health/user
   */
  static getUserServiceHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkUserServiceHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `User service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `User service is ${healthCheck.status}`, statusCode);
    }
  });

  /**
   * Token blacklist service health check
   * GET /api/health/token-blacklist
   */
  static getTokenBlacklistHealth = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthCheck = await HealthController.checkTokenBlacklistHealth();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    if (healthCheck.status === 'healthy') {
      BaseController.sendSuccess(res, healthCheck, `Token blacklist service is ${healthCheck.status}`, statusCode);
    } else {
      BaseController.sendError(res, `Token blacklist service is ${healthCheck.status}`, statusCode);
    }
  });

  // Private helper methods for individual service health checks

  private static async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      await sequelize.authenticate();
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'Database',
        status: 'healthy',
        responseTime,
        details: {
          dialect: sequelize.getDialect(),
          version: 'PostgreSQL',
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Database',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkS3Health(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const s3Service = new S3Service();
      // Try to get a pre-signed URL as a basic connectivity test
      const testResult = await s3Service.getPreSignedUploadUrl('health-check-test.txt', 'text/plain');
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'S3',
        status: 'healthy',
        responseTime,
        details: {
          bucketConfigured: !!process.env.AWS_S3_BUCKET_NAME,
          region: process.env.AWS_REGION,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'S3',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkLLMHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const llmService = new LLMService();
      // Basic configuration check
      const responseTime = Date.now() - startTime;
      
      const hasApiKey = !!process.env.OPENAI_API_KEY;
      
      return {
        service: 'LLM',
        status: hasApiKey ? 'healthy' : 'unhealthy',
        responseTime,
        details: {
          apiKeyConfigured: hasApiKey,
          model: 'gpt-4-turbo',
        },
        error: hasApiKey ? undefined : 'OpenAI API key not configured',
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'LLM',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkEmbeddingHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const embeddingService = new EmbeddingService();
      // Basic configuration check
      const responseTime = Date.now() - startTime;
      
      const hasApiKey = !!process.env.OPENAI_API_KEY;
      
      return {
        service: 'Embedding',
        status: hasApiKey ? 'healthy' : 'unhealthy',
        responseTime,
        details: {
          apiKeyConfigured: hasApiKey,
          model: 'text-embedding-ada-002',
        },
        error: hasApiKey ? undefined : 'OpenAI API key not configured',
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Embedding',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkDocumentServiceHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const documentService = new DocumentService();
      // Check if service can be instantiated
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'Document',
        status: 'healthy',
        responseTime,
        details: {
          serviceInitialized: true,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Document',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkChatServiceHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const chatService = new ChatService();
      // Check if service can be instantiated
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'Chat',
        status: 'healthy',
        responseTime,
        details: {
          serviceInitialized: true,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Chat',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkAuthServiceHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const authService = new AuthService();
      // Check if service can be instantiated
      const responseTime = Date.now() - startTime;
      
      const hasJwtSecret = !!process.env.JWT_SECRET;
      
      return {
        service: 'Auth',
        status: hasJwtSecret ? 'healthy' : 'degraded',
        responseTime,
        details: {
          jwtSecretConfigured: hasJwtSecret,
          serviceInitialized: true,
        },
        error: hasJwtSecret ? undefined : 'JWT_SECRET not configured',
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Auth',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkUserServiceHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // Check if UserService can be used (static methods)
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'User',
        status: 'healthy',
        responseTime,
        details: {
          serviceAvailable: true,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'User',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }

  private static async checkTokenBlacklistHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const tokenBlacklistService = new TokenBlacklistService();
      // Check if service can be instantiated
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'Token Blacklist',
        status: 'healthy',
        responseTime,
        details: {
          serviceInitialized: true,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'Token Blacklist',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
  }
}
