import { S3Service } from './s3.service';
import { EmbeddingService } from './embedding.service';
import { Document } from '../models/document.model';
import { Embedding } from '../models/embedding.model';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import pdfParse from 'pdf-parse';

export interface DocumentProcessingResult {
  document: Document;
  embeddingsCreated: number;
  totalPages: number;
}

export interface DocumentListItem {
  id: number;
  name: string;
  s3Key: string;
  contentType: string;
  fileSize?: number;
  totalPages: number;
  processingStatus: string;
  createdAt: Date;
  updatedAt: Date;
  s3Url?: string;
  embeddingCount: number;
}

export class DocumentService {
  private s3Service: S3Service;
  private embeddingService: EmbeddingService;
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Service = new S3Service();
    this.embeddingService = new EmbeddingService();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  /**
   * Process uploaded PDF document from S3
   * Downloads the file, extracts text, creates embeddings page by page
   * @param s3Key - S3 object key of the uploaded document
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param fileSize - Size of the file in bytes
   * @returns Processing result with document info and embedding count
   */
  async processDocument(
    s3Key: string,
    fileName: string,
    contentType: string,
    fileSize?: number,
  ): Promise<DocumentProcessingResult> {
    // Validate PDF content type
    if (!contentType.includes('pdf')) {
      throw new Error('Only PDF files are supported');
    }

    // Create document record
    const document = await Document.create({
      name: fileName,
      s3Key,
      contentType,
      fileSize,
      processingStatus: 'processing',
    });

    try {
      // Check if file exists in S3 before attempting download
      const fileExists = await this.s3Service.fileExists(s3Key);
      if (!fileExists) {
        throw new Error(`File with key '${s3Key}' does not exist in S3. Please ensure the file has been uploaded before processing.`);
      }

      // Get file metadata if size wasn't provided
      if (!fileSize) {
        try {
          const metadata = await this.s3Service.getFileMetadata(s3Key);
          if (metadata.size) {
            await document.update({ fileSize: metadata.size });
          }
        } catch (metadataError) {
          console.warn('Could not retrieve file metadata:', metadataError);
          // Continue processing even if we can't get metadata
        }
      }

      // Download file from S3
      const fileBuffer = await this.downloadFileFromS3(s3Key);
      
      // Parse PDF and extract text
      const pdfData = await pdfParse(fileBuffer);
      const totalPages = pdfData.numpages;
      const fullText = pdfData.text;

      // Update document with page count
      await document.update({
        totalPages,
      });

      // Split text into pages and create embeddings
      const embeddingsCreated = await this.createPageEmbeddings(
        document.id,
        fullText,
        totalPages,
        fileName,
      );

      // Mark processing as completed
      await document.update({
        processingStatus: 'completed',
      });

      await document.reload();

      return {
        document,
        embeddingsCreated,
        totalPages,
      };
    } catch (error: any) {
      // Mark processing as failed and save error
      await document.update({
        processingStatus: 'failed',
        processingError: error.message,
      });

      console.error('Document processing failed:', error);
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  /**
   * Get all documents with their S3 URLs and embedding counts
   * @returns List of all documents with metadata
   */
  async getAllDocuments(): Promise<DocumentListItem[]> {
    try {
      const documents = await Document.findAll({
        include: [
          {
            model: Embedding,
            attributes: [],
          },
        ],
        attributes: [
          'id',
          'name',
          's3Key',
          'contentType',
          'fileSize',
          'totalPages',
          'processingStatus',
          'createdAt',
          'updatedAt',
          // Count embeddings
          [
            Document.sequelize!.fn('COUNT', Document.sequelize!.col('embeddings.id')),
            'embeddingCount'
          ],
        ],
        group: ['Document.id'],
        raw: false,
      });

      // Add S3 URLs to each document
      const documentsWithUrls: DocumentListItem[] = documents.map((doc: any) => {
        const docData = doc.get({ plain: true });
        return {
          ...docData,
          s3Url: this.s3Service.getFileUrl(docData.s3Key),
          embeddingCount: parseInt(docData.embeddingCount) || 0,
        };
      });

      return documentsWithUrls;
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

  /**
   * Get document by ID with embeddings
   * @param documentId - Document ID
   * @returns Document with embeddings and S3 URL
   */
  async getDocumentById(documentId: number): Promise<DocumentListItem | null> {
    try {
      const document = await Document.findByPk(documentId, {
        include: [
          {
            model: Embedding,
            attributes: ['id', 'pageNumber', 'content', 'tokenCount'],
          },
        ],
      });

      if (!document) {
        return null;
      }

      const docData = document.get({ plain: true }) as any;
      return {
        ...docData,
        s3Url: this.s3Service.getFileUrl(docData.s3Key),
        embeddingCount: docData.embeddings?.length || 0,
      };
    } catch (error: any) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }

  /**
   * Delete document and all associated data
   * Removes from S3, database, and all embeddings
   * @param documentId - Document ID to delete
   * @returns Success message with deletion details
   */
  async deleteDocument(documentId: number): Promise<{
    message: string;
    deletedEmbeddings: number;
    s3Deleted: boolean;
  }> {
    try {
      // Find document
      const document = await Document.findByPk(documentId, {
        include: [Embedding],
      });

      if (!document) {
        throw new Error('Document not found');
      }

      const s3Key = document.s3Key;
      const embeddingCount = document.embeddings?.length || 0;

      // Delete from S3
      let s3Deleted = false;
      try {
        await this.s3Service.deleteFile(s3Key);
        s3Deleted = true;
      } catch (s3Error: any) {
        console.error('S3 deletion failed:', s3Error);
        // Continue with database deletion even if S3 fails
      }

      // Delete all embeddings (cascade should handle this, but explicit for clarity)
      await Embedding.destroy({
        where: { documentId },
      });

      // Delete document
      await document.destroy();

      return {
        message: `Document '${document.name}' deleted successfully`,
        deletedEmbeddings: embeddingCount,
        s3Deleted,
      };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Download file buffer from S3
   * @private
   * @param s3Key - S3 object key
   * @returns File buffer
   */
  private async downloadFileFromS3(s3Key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response from S3');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      console.error('Error downloading file from S3:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Create embeddings for document pages
   * @private
   * @param documentId - Document ID
   * @param fullText - Complete document text
   * @param totalPages - Total number of pages
   * @returns Number of embeddings created
   */
  private async createPageEmbeddings(
    documentId: number,
    fullText: string,
    totalPages: number,
    fileName: string
  ): Promise<number> {
    try {
      // Split text into pages (simple approach - can be improved)
      const pageTexts = this.splitTextIntoPages(fullText, totalPages);
      let embeddingsCreated = 0;

      for (let i = 0; i < pageTexts.length; i++) {
        const pageContent = pageTexts[i].trim();
        
        if (pageContent.length === 0) {
          continue; // Skip empty pages
        }

        // Generate embedding for page content
        const text = `Page ${i + 1} of ${totalPages} from document '${fileName}': ${pageContent}`;
        const embedding = await this.embeddingService.getEmbedding(text);

        // Estimate token count (rough approximation: 1 token ≈ 4 characters)
        const tokenCount = Math.ceil(pageContent.length / 4);

        // Create embedding record
        await Embedding.create({
          documentId,
          pageNumber: i + 1,
          content: text,
          embedding: JSON.stringify(embedding),
          tokenCount,
        });

        embeddingsCreated++;
      }

      return embeddingsCreated;
    } catch (error: any) {
      console.error('Error creating embeddings:', error);
      throw new Error(`Failed to create embeddings: ${error.message}`);
    }
  }

  /**
   * Split text into approximate pages
   * @private
   * @param text - Full document text
   * @param totalPages - Number of pages
   * @returns Array of page texts
   */
  private splitTextIntoPages(text: string, totalPages: number): string[] {
    if (totalPages <= 1) {
      return [text];
    }

    const avgCharsPerPage = Math.ceil(text.length / totalPages);
    const pages: string[] = [];
    
    let currentPosition = 0;
    
    for (let i = 0; i < totalPages; i++) {
      const endPosition = Math.min(currentPosition + avgCharsPerPage, text.length);
      let pageText = text.substring(currentPosition, endPosition);
      
      // Try to break at sentence boundaries for better context
      if (i < totalPages - 1 && endPosition < text.length) {
        const lastSentenceEnd = pageText.lastIndexOf('.');
        if (lastSentenceEnd > avgCharsPerPage * 0.7) {
          pageText = pageText.substring(0, lastSentenceEnd + 1);
          currentPosition += lastSentenceEnd + 1;
        } else {
          currentPosition = endPosition;
        }
      } else {
        currentPosition = endPosition;
      }
      
      pages.push(pageText);
    }

    return pages;
  }
}
