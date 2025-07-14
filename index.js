import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads directory as static
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

app.listen(port, ()=> console.log(`Server rnning on port: ${port}`))