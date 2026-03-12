import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';

try {
  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();
  const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://ask-q-six.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.options("*", cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files for uploads
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);

  let mongoUri = process.env.MONGODB_URI;

  const startServer = async () => {
    try {
      if (!mongoUri) {
        console.log('No MONGODB_URI found. Booting MongoMemoryServer...');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log('MongoMemoryServer started on', mongoUri);
      } else {
        console.log('Connecting to provided MongoDB URI...');
      }

      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.log('MongoDB connection error:', err.message);
    }
  };

  startServer();

} catch (err) {
  console.error("FATAL ERROR IN SERVER.JS:", err);
}
