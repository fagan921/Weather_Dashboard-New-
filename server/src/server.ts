import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';

dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Serve static files of the entire client `dist` folder
app.use(express.static(path.resolve('client', 'dist')));

// ✅ Implement middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Enable CORS for API requests (optional, but useful for dev)
app.use(cors());

// ✅ Implement middleware to connect the routes
app.use(routes);

// ✅ Fallback route to serve index.html for all other routes (SPA support)
app.get('*', (_req, res) => {
  res.sendFile(path.resolve('client', 'dist', 'index.html'));
});

// ✅ Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));