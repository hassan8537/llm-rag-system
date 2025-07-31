import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route GET /api/health/status
 * @description Get comprehensive health status of all services
 * @access Public
 */
router.get('/status', HealthController.getOverallHealth);

/**
 * @route GET /api/health/database
 * @description Get database health status
 * @access Public
 */
router.get('/database', HealthController.getDatabaseHealth);

/**
 * @route GET /api/health/s3
 * @description Get S3 service health status
 * @access Public
 */
router.get('/s3', HealthController.getS3Health);

/**
 * @route GET /api/health/llm
 * @description Get LLM service health status
 * @access Public
 */
router.get('/llm', HealthController.getLLMHealth);

/**
 * @route GET /api/health/embedding
 * @description Get embedding service health status
 * @access Public
 */
router.get('/embedding', HealthController.getEmbeddingHealth);

/**
 * @route GET /api/health/document
 * @description Get document service health status
 * @access Public
 */
router.get('/document', HealthController.getDocumentServiceHealth);

/**
 * @route GET /api/health/chat
 * @description Get chat service health status
 * @access Public
 */
router.get('/chat', HealthController.getChatServiceHealth);

/**
 * @route GET /api/health/auth
 * @description Get authentication service health status
 * @access Public
 */
router.get('/auth', HealthController.getAuthServiceHealth);

/**
 * @route GET /api/health/user
 * @description Get user service health status
 * @access Public
 */
router.get('/user', HealthController.getUserServiceHealth);

/**
 * @route GET /api/health/token-blacklist
 * @description Get token blacklist service health status
 * @access Public
 */
router.get('/token-blacklist', HealthController.getTokenBlacklistHealth);

export default router;
