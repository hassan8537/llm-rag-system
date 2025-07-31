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
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'chats',
  timestamps: true,
})
export class Chat extends Model<Chat> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => require('./chat-message.model').ChatMessage)
  messages!: any[];

  @Column({
    type: DataType.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active',
  })
  status!: 'active' | 'archived' | 'deleted';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: {
    totalMessages?: number;
    lastQueryTime?: Date;
    totalTokensUsed?: number;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Chat;
