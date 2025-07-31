import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { Embedding } from './embedding.model';

@Table({
  tableName: 'documents',
  timestamps: true,
})
export class Document extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  s3Key!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contentType!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  fileSize?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  totalPages!: number;

  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  })
  processingStatus!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  processingError?: string;

  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

  // Associations
  @HasMany(() => Embedding)
  embeddings!: Embedding[];
}
