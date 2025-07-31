import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const chatController = new ChatController();

/**
 * @route GET /api/chats
 * @description Get all chats for the authenticated user
 * @access Private
 * @query includeMessages - Include chat messages in response (optional, default: false)
 */
router.get('/', AuthMiddleware.authenticate, chatController.getChats);

/**
 * @route POST /api/chats
 * @description Create a new chat with initial query (RAG-enabled)
 * @access Private
 * @body query - Initial query to process (required)
 * @body title - Chat title (optional, will be auto-generated if not provided)
 */
router.post('/', AuthMiddleware.authenticate, chatController.createChat);

/**
 * @route GET /api/chats/stats
 * @description Get chat statistics for the user
 * @access Private
 */
router.get('/stats', AuthMiddleware.authenticate, chatController.getChatStats);

/**
 * @route POST /api/chats/:chatId/query
 * @description Send a query to an existing chat (RAG-enabled)
 * @access Private
 * @param chatId - Chat ID
 * @body query - Query to process (required)
 */
router.post('/:chatId/query', AuthMiddleware.authenticate, chatController.queryChat);

/**
 * @route GET /api/chats/:chatId
 * @description Get a single chat by ID with messages
 * @access Private
 * @param chatId - Chat ID
 * @query includeMessages - Include chat messages in response (optional, default: true)
 */
router.get('/:chatId', AuthMiddleware.authenticate, chatController.getChatById);

/**
 * @route PUT /api/chats/:chatId
 * @description Update a chat title or description
 * @access Private
 * @param chatId - Chat ID
 * @body title - Chat title (optional)
 * @body description - Chat description (optional)
 */
router.put('/:chatId', AuthMiddleware.authenticate, chatController.updateChat);

/**
 * @route DELETE /api/chats/:chatId
 * @description Delete a chat and all its messages
 * @access Private
 * @param chatId - Chat ID
 */
router.delete('/:chatId', AuthMiddleware.authenticate, chatController.deleteChat);

export default router;
