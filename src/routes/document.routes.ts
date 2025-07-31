import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const documentController = new DocumentController();

/**
 * Document routes
 * All routes require authentication
 */

// Process uploaded document from S3
router.post('/process', AuthMiddleware.authenticate, documentController.processDocument);

// Get all documents
router.get('/', AuthMiddleware.authenticate, documentController.getAllDocuments);

// Get document by ID
router.get('/:id', AuthMiddleware.authenticate, documentController.getDocumentById);

// Get document processing status
router.get('/:id/status', AuthMiddleware.authenticate, documentController.getDocumentStatus);

// Delete document (and all related embeddings)
router.delete('/:id', AuthMiddleware.authenticate, documentController.deleteDocument);

export default router;
