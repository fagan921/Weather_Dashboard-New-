import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';

dotenv.config();

// Import your routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the "client/dist" directory
// This will serve files like index.html, JS, CSS, images from the dist folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// Implement middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS (optional for API)
app.use(cors());

// Connect your routes (for API routes)
app.use(routes);

// Catch-all route for Single Page Apps (SPA)
// Any other route will fallback to index.html for frontend navigation
app.get('*', (_req, res) => {
  // Correct path resolution for index.html in client/dist
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));