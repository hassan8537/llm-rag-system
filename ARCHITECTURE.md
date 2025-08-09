# MVC Architecture Implementation

This document outlines the Model-View-Controller (MVC) architecture implementation for the Motor Backend API.

## Architecture Overview

### 📁 Directory Structure
```
src/
├── controllers/          # Request handlers and response logic
│   ├── base.controller.ts       # Base controller with common methods
│   ├── user.controller.ts       # User-specific controller
│   ├── auth.controller.ts       # Authentication controller
│   ├── chat.controller.ts       # Chat and RAG controller
│   ├── document.controller.ts   # Document processing controller
│   ├── s3.controller.ts         # S3 file operations controller
│   ├── health.controller.ts     # Health check controller
│   └── example.controller.ts    # Template controller
├── middleware/           # Request processing middleware
│   ├── validation.middleware.ts # Input validation
│   ├── auth.middleware.ts       # Authentication middleware
│   └── error.middleware.ts      # Error handling
├── models/              # Database models (Sequelize)
│   ├── user.model.ts    # User entity definition
│   ├── chat.model.ts    # Chat entity definition
│   ├── chat-message.model.ts    # Chat message entity
│   ├── document.model.ts        # Document entity
│   └── embedding.model.ts       # Vector embedding entity
├── services/            # Business logic layer
│   ├── user.service.ts  # User business operations
│   ├── auth.service.ts  # Authentication logic
│   ├── chat.service.ts  # Chat and RAG operations
│   ├── document.service.ts      # Document processing
│   ├── embedding.service.ts     # Vector operations
│   ├── llm.service.ts   # Language model integration
│   ├── s3.service.ts    # AWS S3 operations
│   └── token-blacklist.service.ts # Token management
├── routes/              # API route definitions
│   ├── user.routes.ts   # User endpoint mappings
│   ├── auth.routes.ts   # Authentication routes
│   ├── chat.routes.ts   # Chat API routes
│   ├── document.routes.ts       # Document API routes
│   ├── s3.routes.ts     # S3 API routes
│   └── health.routes.ts # Health check routes
├── types/               # TypeScript type definitions
│   ├── user.types.ts    # User-related types
│   └── api.types.ts     # API response types
├── config/              # Configuration files
│   ├── database.ts      # Database configuration
│   └── openai.ts        # OpenAI client configuration
├── database/            # Database connection
│   └── connection.ts    # Sequelize connection setup
├── utils/               # Utility functions
│   └── migrator.ts      # Database migration runner
└── scripts/             # Utility scripts
    ├── init-db.ts       # Database initialization
    └── seed-db.ts       # Sample data seeding
```

## Layer Responsibilities

### 🎮 Controllers
**Purpose**: Handle HTTP requests/responses and coordinate between services
- Extract and validate request parameters
- Call appropriate service methods
- Format and send responses
- Handle errors gracefully

**Key Features**:
- Extend `BaseController` for common functionality
- Use static methods for route handlers
- Consistent response formatting
- Proper error handling

**Example**:
```typescript
public static async createUser(req: Request, res: Response): Promise<void> {
  try {
    const userData: CreateUserDto = req.body;
    const result = await UserService.createUser(userData);
    
    if (result.success) {
      UserController.sendSuccess(res, result.data, result.message, 201);
    } else {
      UserController.sendError(res, result.message, 400, result.error);
    }
  } catch (error: any) {
    UserController.sendInternalError(res, error);
  }
}
```

### 🔧 Services
**Purpose**: Contain business logic and data operations
- Implement business rules
- Interact with database models
- Handle complex operations
- Return standardized responses

**Key Features**:
- Pure business logic (no HTTP concerns)
- Reusable across different controllers
- Error handling and validation
- Transaction management

**Example**:
```typescript
public static async createUser(userData: CreateUserDto): Promise<UserResponse> {
  try {
    const user = await User.create(userData);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create user',
    };
  }
}
```

### 🛣️ Routes
**Purpose**: Define API endpoints and apply middleware
- Map HTTP methods to controller actions
- Apply validation middleware
- Group related endpoints
- Document API endpoints

**Key Features**:
- Clean and readable route definitions
- Middleware chaining
- Route-specific validation
- API documentation comments

**Example**:
```typescript
router.post('/', validateCreateUser, UserController.createUser);
router.get('/:id', validateIdParam, UserController.getUserById);
```

### 🛡️ Middleware
**Purpose**: Process requests before reaching controllers
- Input validation
- Authentication/authorization
- Error handling
- Request logging

**Types**:
1. **Validation Middleware**: Validates request data
2. **Error Middleware**: Handles application errors
3. **Authentication Middleware**: Verifies user identity
4. **Logging Middleware**: Records request information

### 🗄️ Models
**Purpose**: Define data structure and database interactions
- Database schema definition
- Validation rules
- Relationships between entities
- Instance and static methods

**Key Features**:
- Sequelize TypeScript decorators
- Type-safe database operations
- Built-in validation
- Automatic timestamps

## Best Practices Implemented

### ✅ Controller Best Practices
1. **No Business Logic**: Controllers only handle HTTP concerns
2. **Consistent Responses**: Use BaseController methods for responses
3. **Error Handling**: Always wrap in try-catch blocks
4. **Validation**: Validate inputs before processing
5. **Type Safety**: Use TypeScript interfaces for type checking

### ✅ Service Best Practices
1. **Single Responsibility**: Each service handles one domain
2. **Reusability**: Services can be used by multiple controllers
3. **Error Handling**: Return standardized error responses
4. **Transactions**: Use database transactions for complex operations
5. **Testing**: Services are easily unit testable

### ✅ Route Best Practices
1. **RESTful Design**: Follow REST conventions
2. **Middleware Usage**: Apply appropriate middleware
3. **Documentation**: Comment all routes
4. **Validation**: Use validation middleware
5. **Grouping**: Group related routes logically

### ✅ Middleware Best Practices
1. **Separation of Concerns**: Each middleware has one purpose
2. **Reusability**: Middleware can be applied to multiple routes
3. **Error Handling**: Proper error responses
4. **Performance**: Efficient validation logic
5. **Type Safety**: TypeScript support

## Response Format Standards

### Success Response
```typescript
{
  success: true,
  message: "Operation successful",
  data: { /* result data */ },
  timestamp: "2025-07-31T10:30:00.000Z"
}
```

### Error Response
```typescript
{
  success: false,
  message: "Error description",
  error: "Detailed error message",
  timestamp: "2025-07-31T10:30:00.000Z"
}
```

### Validation Error Response
```typescript
{
  success: false,
  message: "Validation failed",
  errors: [
    {
      field: "email",
      message: "Invalid email format",
      value: "invalid-email"
    }
  ],
  timestamp: "2025-07-31T10:30:00.000Z"
}
```

## Adding New Features

### 1. Create Model
```typescript
// src/models/product.model.ts
@Table({ tableName: 'products' })
export class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;
  
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;
}
```

### 2. Create Types
```typescript
// src/types/product.types.ts
export interface CreateProductDto {
  name: string;
  price: number;
}

export interface ProductResponse {
  success: boolean;
  data?: Product | Product[];
  message: string;
  error?: string;
}
```

### 3. Create Service
```typescript
// src/services/product.service.ts
export class ProductService {
  public static async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    // Business logic here
  }
}
```

### 4. Create Controller
```typescript
// src/controllers/product.controller.ts
export class ProductController extends BaseController {
  public static async createProduct(req: Request, res: Response): Promise<void> {
    // Controller logic here
  }
}
```

### 5. Create Middleware
```typescript
// src/middleware/product.middleware.ts
export const validateCreateProduct = (req: Request, res: Response, next: NextFunction): void => {
  // Validation logic here
};
```

### 6. Create Routes
```typescript
// src/routes/product.routes.ts
router.post('/', validateCreateProduct, ProductController.createProduct);
```

### 7. Register Routes
```typescript
// src/index.ts
import productRoutes from './routes/product.routes';
app.use('/api/products', productRoutes);
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to modify and extend
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Services and middleware can be reused
5. **Type Safety**: Full TypeScript support
6. **Scalability**: Easy to add new features
7. **Consistency**: Standardized patterns across the application
8. **Error Handling**: Comprehensive error management
9. **Validation**: Input validation at multiple levels
10. **Documentation**: Clear code structure and comments

## Health Check System

### Overview
The health check system provides comprehensive monitoring of all application services and dependencies. It helps ensure system reliability and enables proactive monitoring.

### Health Check Controller
The `HealthController` provides endpoints to monitor:
- **Database connectivity** - PostgreSQL connection status
- **S3 service** - AWS S3 configuration and access
- **LLM service** - OpenAI API connectivity for language models
- **Embedding service** - OpenAI API for vector embeddings
- **Document service** - Document processing capabilities
- **Chat service** - RAG (Retrieval Augmented Generation) functionality
- **Auth service** - Authentication and JWT configuration
- **User service** - User management operations
- **Token blacklist service** - Security token management

### Health Status Types
- **Healthy** 🟢 - Service fully operational
- **Degraded** 🟡 - Service partially operational with limitations
- **Unhealthy** 🔴 - Service not operational, requires attention

### Key Features
- **Comprehensive monitoring** - All critical services covered
- **Response time tracking** - Performance monitoring
- **Dependency validation** - External service connectivity
- **Configuration checks** - Environment variable validation
- **Detailed error reporting** - Specific failure information
- **Public accessibility** - Supports load balancer health checks

### Usage
```bash
# Overall system health
GET /api/health/status

# Individual service health
GET /api/health/database
GET /api/health/s3
GET /api/health/llm
# ... other services
```

For detailed health check documentation, see [HEALTH_CHECK_API.md](./HEALTH_CHECK_API.md).
