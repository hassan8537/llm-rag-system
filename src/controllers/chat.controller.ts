import { Request, Response } from 'express';
import { ChatService, CreateChatRequest, ChatQueryRequest } from '../services/chat.service';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Get all chats for the authenticated user with message summaries
   */
  getChats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const includeMessages = req.query.includeMessages === 'true';
      const chats = await this.chatService.getChats(userId, includeMessages);

      res.status(200).json({
        success: true,
        data: {
          chats,
          count: chats.length,
        },
        message: 'Chats retrieved successfully',
      });
    } catch (error: any) {
      console.error('Error in getChats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get chats',
      });
    }
  };

  /**
   * Create a new chat with initial query (RAG-enabled)
   */
  createChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { query, title } = req.body;

      // Validation
      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Query is required to start a chat',
        });
        return;
      }

      if (query.length > 2000) {
        res.status(400).json({
          success: false,
          message: 'Query must be less than 2000 characters',
        });
        return;
      }

      if (title && title.length > 200) {
        res.status(400).json({
          success: false,
          message: 'Chat title must be less than 200 characters',
        });
        return;
      }

      const chatData: CreateChatRequest = {
        query: query.trim(),
        userId: userId,
        title: title?.trim(),
      };

      const queryResponse = await this.chatService.createChat(chatData);

      res.status(201).json({
        success: true,
        data: queryResponse,
        message: 'Chat created and query processed successfully',
      });
    } catch (error: any) {
      console.error('Error in createChat:', error);
      
      if (error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (error.message.includes('No relevant context found') || error.message.includes('embedding')) {
        res.status(400).json({
          success: false,
          message: 'Unable to process query. Please ensure you have uploaded relevant documents first.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create chat',
      });
    }
  };

  /**
   * Send a query to an existing chat (RAG-enabled)
   */
  queryChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { chatId } = req.params;
      const { query } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Query is required',
        });
        return;
      }

      if (query.length > 2000) {
        res.status(400).json({
          success: false,
          message: 'Query must be less than 2000 characters',
        });
        return;
      }

      const queryData: ChatQueryRequest = {
        query: query.trim(),
        chatId,
        userId: userId,
      };

      const queryResponse = await this.chatService.processQuery(queryData);

      res.status(200).json({
        success: true,
        data: queryResponse,
        message: 'Query processed successfully',
      });
    } catch (error: any) {
      console.error('Error in queryChat:', error);
      
      if (error.message.includes('Chat not found') || error.message.includes('access denied')) {
        res.status(404).json({
          success: false,
          message: 'Chat not found or access denied',
        });
        return;
      }

      if (error.message.includes('No relevant context found') || error.message.includes('embedding')) {
        res.status(400).json({
          success: false,
          message: 'Unable to find relevant information in your documents for this query.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process query',
      });
    }
  };

  /**
   * Get a single chat by ID with messages
   */
  getChatById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { chatId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      const includeMessages = req.query.includeMessages !== 'false'; // Default to true
      const result = await this.chatService.getChatById(chatId, userId, includeMessages);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Chat retrieved successfully',
      });
    } catch (error: any) {
      console.error('Error in getChatById:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get chat',
      });
    }
  };

  /**
   * Update a chat title or description
   */
  updateChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { chatId } = req.params;
      const { title, description } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      // Validation
      if (title !== undefined && (title.trim().length === 0 || title.length > 200)) {
        res.status(400).json({
          success: false,
          message: 'Chat title must be between 1 and 200 characters',
        });
        return;
      }

      if (description !== undefined && description.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Chat description must be less than 1000 characters',
        });
        return;
      }

      const updates: { title?: string; description?: string } = {};
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();

      const chat = await this.chatService.updateChat(chatId, userId, updates);

      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: chat,
        message: 'Chat updated successfully',
      });
    } catch (error: any) {
      console.error('Error in updateChat:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update chat',
      });
    }
  };

  /**
   * Delete a chat and all its messages
   */
  deleteChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { chatId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      const deleted = await this.chatService.deleteChat(chatId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Chat deleted successfully',
      });
    } catch (error: any) {
      console.error('Error in deleteChat:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete chat',
      });
    }
  };

  /**
   * Get chat statistics for the user
   */
  getChatStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await this.chatService.getChatStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Chat statistics retrieved successfully',
      });
    } catch (error: any) {
      console.error('Error in getChatStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get chat statistics',
      });
    }
  };
}
