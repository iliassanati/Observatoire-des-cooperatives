import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import colors from 'colors';

import userRoutes from './routes/userRoutes.js';

const app = express();

dotenv.config();

connectDB();

app.use(express.json());

app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000'.yellow.bold);
});
