import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { Document } from './document.model';

export interface EmbeddingSearchResult {
  documentId: string;
  pageNumber: string;
  content: string;
  similarity: number;
}

@Table({
  tableName: 'embeddings',
  timestamps: true,
})
export class Embedding extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Document)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  documentId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pageNumber!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.TEXT, // Keep as TEXT for now, migrate later
    allowNull: false,
  })
  embedding!: number[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  tokenCount!: number;

  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => Document)
  document!: Document;

  /**
   * Searches for the most similar documents using vector similarity.
   * 
   * @param queryEmbedding - The embedding vector to search with
   * @param limit - Number of results to return (default: 1)
   * @returns Array of documents with similarity scores
   */
  static async searchDocumentsByEmbedding(
    queryEmbedding: number[],
    limit: number = 1
  ): Promise<EmbeddingSearchResult[]> {
    // Validate inputs
    this.validateSearchInputs(queryEmbedding, limit);
    
    // Prepare query parameters
    const embeddingVector = `[${queryEmbedding.join(',')}]`;
    const sqlQuery = this.buildSimilarityQuery();
    
    try {
      const rawResults = await this.executeSearchQuery(sqlQuery, embeddingVector, limit);
      return this.formatSearchResults(rawResults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Document similarity search failed: ${errorMessage}`);
    }
  }

  /**
   * Validates search input parameters
   */
  private static validateSearchInputs(queryEmbedding: number[], limit: number): void {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Query embedding cannot be empty');
    }

    if (limit <= 0) {
      throw new Error('Limit must be greater than 0');
    }

    if (limit > 100) {
      throw new Error('Limit cannot exceed 100 results');
    }
  }

  /**
   * Builds the SQL query for similarity search
   */
  private static buildSimilarityQuery(): string {
    return `
      SELECT 
        e."documentId", 
        e."pageNumber",
        e."content",
        1 - (e.embedding::vector <=> :embeddingVector::vector) AS similarity
      FROM embeddings e
      ORDER BY similarity DESC
      LIMIT :limitValue;
    `;
  }

  /**
   * Executes the similarity search query
   */
  private static async executeSearchQuery(
    query: string, 
    embeddingVector: string, 
    limit: number
  ): Promise<Array<{ documentId: string; pageNumber: string; content: string; similarity: number }>> {
    return await this.sequelize!.query(query, {
      replacements: {
        embeddingVector,
        limitValue: limit,
      },
      type: QueryTypes.SELECT,
    }) as Array<{ documentId: string; pageNumber: string; content: string; similarity: number }>;
  }

  /**
   * Formats raw query results into the expected interface
   */
  private static formatSearchResults(
    rawResults: Array<{ documentId: string; pageNumber: string; content: string; similarity: number }>
  ): EmbeddingSearchResult[] {
    return rawResults.map(row => ({
      documentId: row.documentId,
      pageNumber: row.pageNumber,
      content: row.content,
      similarity: Number(row.similarity),
    }));
  }

  
}