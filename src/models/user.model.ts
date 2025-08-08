import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  IsEmail,
  Length,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Length({ min: 2, max: 50 })
  @Column(DataType.STRING)
  firstName!: string;

  @AllowNull(false)
  @Length({ min: 2, max: 50 })
  @Column(DataType.STRING)
  lastName!: string;

  @AllowNull(false)
  @Unique
  @IsEmail
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Length({ min: 6, max: 255 })
  @Column(DataType.STRING)
  password!: string;

  @AllowNull(true)
  @Length({ min: 10, max: 15 })
  @Column(DataType.STRING)
  phone?: string;

  @AllowNull(false)
  @Default("user")
  @Column(DataType.ENUM("admin", "user"))
  role?: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Instance method example
  public async deactivate(): Promise<void> {
    this.isActive = false;
    await this.save();
  }

  // Static method example
  public static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }
}
