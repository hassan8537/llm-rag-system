# RAG App Backend

A **TypeScript** backend application built with **Express.js**, **PostgreSQL**, **OpenAI**, and **Sequelize ORM**.

---

## 🚀 Features

- ✅ TypeScript with strict configuration
- ✅ Express.js web framework
- ✅ PostgreSQL with Sequelize ORM
- ✅ Type-safe database models
- ✅ RESTful API endpoints
- ✅ OpenAI integration for embeddings & LLM
- ✅ Environment variable configuration
- ✅ Database migrations & seeding
- ✅ Development hot-reload with Nodemon
- ✅ MVC architecture with controllers & services

---

## 📦 Prerequisites

- **Node.js** v16+
- **PostgreSQL** v12+
- npm or yarn

---

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

1. Install PostgreSQL and create databases:
```sql
CREATE DATABASE motor_backend_dev;
CREATE DATABASE motor_backend_test;
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=motor_backend_dev
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
OPENAI_API_KEY=your_openai_api_key
```

### 3. Initialize Database
```bash
npm run db:init      # Create tables
npm run db:seed      # (Optional) Seed with sample data
```

### 4. Start Server
```bash
npm run dev          # Development mode
npm run build && npm start  # Production mode
```

---

## 📡 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/api/health/status` | Full system health |
| GET | `/api/health/database` | Database status |
| GET | `/api/health/s3` | S3 service status |
| GET | `/api/health/llm` | LLM service status |
| GET | `/api/health/embedding` | Embedding service status |
| GET | `/api/health/document` | Document service status |
| GET | `/api/health/chat` | Chat service status |
| GET | `/api/health/auth` | Auth service status |
| GET | `/api/health/user` | User service status |
| GET | `/api/health/token-blacklist` | Token blacklist status |

### Users API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/email/:email` | Get user by email |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/deactivate` | Deactivate user |
| DELETE | `/api/users/:id` | Delete user |

---

## 🧩 Example API Usage

**Create User**
```bash
curl -X POST http://localhost:3000/api/users   -H "Content-Type: application/json"   -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

**Get All Users**
```bash
curl http://localhost:3000/api/users
```

---

## 📂 Project Structure
```
src/
├── config/          # Configuration files
│   └── database.ts
├── database/        # Database connection
│   └── connection.ts
├── models/          # Sequelize models
│   └── user.model.ts
├── routes/          # API routes
│   └── user.routes.ts
├── services/        # Business logic
│   └── user.service.ts
├── scripts/         # DB scripts
│   ├── init-db.ts
│   └── seed-db.ts
├── types/           # Type definitions
│   └── user.types.ts
└── index.ts         # App entry point
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (hot-reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run watch` | Build in watch mode |
| `npm run clean` | Clean dist folder |
| `npm run db:init` | Initialize DB tables |
| `npm run db:seed` | Seed sample data |

---

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `motor_backend_dev` |
| `DB_USER` | Database user | `postgres` |
| `OPENAI_API_KEY` | OpenAI key | — |
| `AWS_ACCESS_KEY_ID` | AWS access key | — |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | — |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | — |
| `AWS_REGION` | AWS region | `us-east-1` |
| `JWT_SECRET` | JWT signing secret | — |

---

## 🛠 Development Guide

**Adding a New Model**
1. Create model in `src/models/`
2. Define types in `src/types/`
3. Create service in `src/services/`
4. Add routes in `src/routes/`
5. Register routes in `index.ts`

**Database Examples**
```ts
// Create
const user = await User.create({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

// Find
const users = await User.findAll();
const user = await User.findByPk(1);
const user = await User.findOne({ where: { email: 'john@example.com' } });

// Update
await user.update({ firstName: 'Jane' });

// Delete
await user.destroy();
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open a PR

---

## 📄 License
This project is licensed under the **MIT License**.

