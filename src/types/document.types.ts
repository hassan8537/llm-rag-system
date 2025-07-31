export interface CreateDocumentDto {
  name: string;
  s3Key: string;
  contentType: string;
  fileSize?: number;
}

export interface ProcessDocumentDto {
  s3Key: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
}

export interface DocumentResponseDto {
  id: number;
  name: string;
  s3Key: string;
  contentType: string;
  fileSize?: number;
  totalPages: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
  s3Url?: string;
  embeddingCount: number;
}

export interface DocumentProcessingResultDto {
  document: {
    id: number;
    name: string;
    s3Key: string;
    processingStatus: string;
    totalPages: number;
    embeddingsCreated: number;
  };
}

export interface DocumentStatusDto {
  id: number;
  name: string;
  processingStatus: string;
  totalPages: number;
  embeddingCount: number;
}

export interface DeleteDocumentResultDto {
  message: string;
  details: {
    deletedEmbeddings: number;
    s3Deleted: boolean;
  };
}
