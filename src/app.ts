import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as handlers from './handlers';
import authRouter from './router/authRouter';
import cookieParser from 'cookie-parser'
import noteRouter from './router/noteRouter';


require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser())

// Basic route for API health check
// Socket.io is configured in index.ts
app.get('/', (req, res) => {
  res.json({
    message: 'ok',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/note', noteRouter);

app.use(handlers.notFound);
app.use(handlers.errorHandler);

export default app;
