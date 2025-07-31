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
import { Document } from './document.model';

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
    type: DataType.JSON,
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
}
