import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { BaseController } from './base.controller';

export interface ProcessDocumentRequest {
  s3Key: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
}

export class DocumentController extends BaseController {
  private documentService: DocumentService;

  constructor() {
    super();
    this.documentService = new DocumentService();
  }

  /**
   * Process uploaded document from S3
   * POST /api/documents/process
   */
  processDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { s3Key, fileName, contentType, fileSize }: ProcessDocumentRequest = req.body;

      // Validate required fields
      if (!s3Key || !fileName || !contentType) {
        BaseController.sendError(res, 'Missing required fields: s3Key, fileName, contentType', 400);
        return;
      }

      // Validate PDF content type
      if (!contentType.includes('pdf')) {
        BaseController.sendError(res, 'Only PDF files are supported', 400);
        return;
      }

      const result = await this.documentService.processDocument(
        s3Key,
        fileName,
        contentType,
        fileSize
      );

      BaseController.sendSuccess(res, {
        message: 'Document processed successfully',
        document: {
          id: result.document.id,
          name: result.document.name,
          s3Key: result.document.s3Key,
          processingStatus: result.document.processingStatus,
          totalPages: result.totalPages,
          embeddingsCreated: result.embeddingsCreated,
        },
      }, 'Document processed successfully', 201);
    } catch (error: any) {
      console.error('Document processing error:', error);
      BaseController.sendError(res, error.message || 'Document processing failed', 500);
    }
  };

  /**
   * Get all documents
   * GET /api/documents
   */
  getAllDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const documents = await this.documentService.getAllDocuments();

      BaseController.sendSuccess(res, {
        documents,
        count: documents.length,
      });
    } catch (error: any) {
      console.error('Get documents error:', error);
      BaseController.sendError(res, error.message || 'Failed to fetch documents', 500);
    }
  };

  /**
   * Get document by ID
   * GET /api/documents/:id
   */
  getDocumentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const documentId = parseInt(req.params.id);

      if (isNaN(documentId)) {
        BaseController.sendError(res, 'Invalid document ID', 400);
        return;
      }

      const document = await this.documentService.getDocumentById(documentId);

      if (!document) {
        BaseController.sendNotFound(res, 'Document not found');
        return;
      }

      BaseController.sendSuccess(res, { document });
    } catch (error: any) {
      console.error('Get document error:', error);
      BaseController.sendError(res, error.message || 'Failed to fetch document', 500);
    }
  };

  /**
   * Delete document
   * DELETE /api/documents/:id
   */
  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const documentId = parseInt(req.params.id);

      if (isNaN(documentId)) {
        BaseController.sendError(res, 'Invalid document ID', 400);
        return;
      }

      const result = await this.documentService.deleteDocument(documentId);

      BaseController.sendSuccess(res, {
        message: result.message,
        details: {
          deletedEmbeddings: result.deletedEmbeddings,
          s3Deleted: result.s3Deleted,
        },
      });
    } catch (error: any) {
      console.error('Delete document error:', error);
      BaseController.sendError(res, error.message || 'Failed to delete document', 500);
    }
  };

  /**
   * Get document processing status
   * GET /api/documents/:id/status
   */
  getDocumentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const documentId = parseInt(req.params.id);

      if (isNaN(documentId)) {
        BaseController.sendError(res, 'Invalid document ID', 400);
        return;
      }

      const document = await this.documentService.getDocumentById(documentId);

      if (!document) {
        BaseController.sendNotFound(res, 'Document not found');
        return;
      }

      BaseController.sendSuccess(res, {
        id: document.id,
        name: document.name,
        processingStatus: document.processingStatus,
        totalPages: document.totalPages,
        embeddingCount: document.embeddingCount,
      });
    } catch (error: any) {
      console.error('Get document status error:', error);
      BaseController.sendError(res, error.message || 'Failed to fetch document status', 500);
    }
  };
}
