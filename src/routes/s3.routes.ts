import { Router } from 'express';
import { S3Controller } from '../controllers/s3.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/s3/upload-url
 * @desc    Get pre-signed URL for file upload
 * @access  Private
 */
router.post('/upload-url', AuthMiddleware.authenticate, S3Controller.getUploadUrl);

/**
 * @route   DELETE /api/s3/file/:key
 * @desc    Delete file from S3
 * @access  Private
 */
router.delete('/file/:key', AuthMiddleware.authenticate, S3Controller.deleteFile);

/**
 * @route   GET /api/s3/file-url/:key
 * @desc    Get public file URL
 * @access  Private
 */
router.get('/file-url/:key', AuthMiddleware.authenticate, S3Controller.getFileUrl);

/**
 * @route   GET /api/s3/download-url/:key
 * @desc    Get pre-signed download URL
 * @access  Private
 */
router.get('/download-url/:key', AuthMiddleware.authenticate, S3Controller.getDownloadUrl);

export default router;
