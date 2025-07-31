import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { S3Service } from '../services/s3.service';

export class S3Controller extends BaseController {
  private static s3Service = new S3Service();

  /**
   * Get pre-signed URL for file upload
   */
  static getUploadUrl = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { fileName, contentType } = req.body;

    // Validate required fields
    if (!fileName) {
      BaseController.sendValidationError(res, 'fileName is required');
      return;
    }

    try {
      const result = await S3Controller.s3Service.getPreSignedUploadUrl(
        fileName,
        contentType
      );

      BaseController.sendSuccess(res, result, 'Pre-signed upload URL generated successfully');
    } catch (error: any) {
      BaseController.sendInternalError(res, error);
    }
  });

  /**
   * Delete file from S3
   */
  static deleteFile = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    if (!key) {
      BaseController.sendValidationError(res, 'File key is required');
      return;
    }

    try {
      const result = await S3Controller.s3Service.deleteFile(key);
      BaseController.sendSuccess(res, result, 'File deleted successfully');
    } catch (error: any) {
      BaseController.sendInternalError(res, error);
    }
  });

  /**
   * Get file public URL
   */
  static getFileUrl = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    if (!key) {
      BaseController.sendValidationError(res, 'File key is required');
      return;
    }

    try {
      const fileUrl = S3Controller.s3Service.getFileUrl(key);
      BaseController.sendSuccess(res, { fileUrl }, 'File URL retrieved successfully');
    } catch (error: any) {
      BaseController.sendInternalError(res, error);
    }
  });

  /**
   * Get pre-signed download URL
   */
  static getDownloadUrl = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    if (!key) {
      BaseController.sendValidationError(res, 'File key is required');
      return;
    }

    try {
      const downloadUrl = await S3Controller.s3Service.getPreSignedDownloadUrl(key);
      BaseController.sendSuccess(res, { downloadUrl }, 'Pre-signed download URL generated successfully');
    } catch (error: any) {
      BaseController.sendInternalError(res, error);
    }
  });
}
