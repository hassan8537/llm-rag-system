import 'reflect-metadata';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { connectDatabase } from './database/connection';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import s3Routes from './routes/s3.routes';
import documentRoutes from './routes/document.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { AdminSeeder } from './middleware/admin-seeder.middleware';


const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Motor Backend API is running!' });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/s3', s3Routes);
app.use('/api/documents', documentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/health', healthRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Run admin seeder
    await AdminSeeder.seedOnStartup();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
