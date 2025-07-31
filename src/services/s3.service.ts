import { S3Client, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export interface PreSignedUrlResponse {
  uploadUrl: string;
  key: string;
  fileName: string; // The sanitized file name
  expiresIn: number;
}

export interface S3Config {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Initialize AWS S3 client
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Validate required environment variables
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
    }
  }

  /**
   * Sanitize file name to be browser-safe
   * @param fileName - Original file name
   * @returns Sanitized file name
   */
  private sanitizeFileName(fileName: string): string {
    // Remove or replace problematic characters
    return fileName
      // Replace spaces with underscores
      .replace(/\s+/g, '_')
      // Remove special characters except dots, dashes, and underscores
      .replace(/[^a-zA-Z0-9._-]/g, '')
      // Remove multiple consecutive dots
      .replace(/\.{2,}/g, '.')
      // Remove leading/trailing dots and dashes
      .replace(/^[.-]+|[.-]+$/g, '')
      // Ensure it's not empty and has reasonable length
      .substring(0, 100)
      // If empty after sanitization, provide a default name
      || 'file';
  }

  /**
   * Generate pre-signed URL for file upload
   * @param fileName - Name of the file to upload
   * @param contentType - MIME type of the file (optional)
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Pre-signed URL and file key
   */
  async getPreSignedUploadUrl(
    fileName: string,
    contentType?: string,
    expiresIn: number = 3600
  ): Promise<PreSignedUrlResponse> {
    try {
      // Sanitize the file name to be browser-safe
      const sanitizedFileName = this.sanitizeFileName(fileName);
      
      // Generate unique key with timestamp
      const timestamp = Date.now();
      const key = `uploads/${timestamp}-${sanitizedFileName}`;

      // Create put object command
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read', 
      });

      // Generate pre-signed URL
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        uploadUrl,
        key,
        fileName: sanitizedFileName,
        expiresIn,
      };
    } catch (error: any) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3 bucket
   * @param key - S3 object key to delete
   * @returns Success message
   */
  async deleteFile(key: string): Promise<{ message: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      return {
        message: `File ${key} deleted successfully`,
      };
    } catch (error: any) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file URL (for public buckets)
   * @param key - S3 object key
   * @returns Public file URL
   */
  getFileUrl(key: string): string {
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Check if file exists in S3 bucket
   * @param key - S3 object key
   * @returns Boolean indicating if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   * @param key - S3 object key
   * @returns File metadata including size, last modified, etc.
   */
  async getFileMetadata(key: string): Promise<{
    size?: number;
    lastModified?: Date;
    contentType?: string;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      return {
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
      };
    } catch (error: any) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate pre-signed URL for file download
   * @param key - S3 object key
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns Pre-signed download URL
   */
  async getPreSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return downloadUrl;
    } catch (error: any) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }
}
