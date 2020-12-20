import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';

const app = express();

dotenv.config();

// connectDB();

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(express.json());

app.listen(3000, () => {
  console.log('Server running on port 3000'.yellow.bold);
});
