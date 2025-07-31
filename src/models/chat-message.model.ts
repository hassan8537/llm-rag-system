import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Chat } from './chat.model';

@Table({
  tableName: 'chat_messages',
  timestamps: true,
})
export class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  chatId!: string;

  @BelongsTo(() => Chat)
  chat!: Chat;

  @Column({
    type: DataType.ENUM('user', 'assistant'),
    allowNull: false,
  })
  role!: 'user' | 'assistant';

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    tokensUsed?: number;
    model?: string;
    searchResults?: any[];
    processingTime?: number;
    contextUsed?: string;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
