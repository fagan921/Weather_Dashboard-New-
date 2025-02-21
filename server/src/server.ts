import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// This is necessary to resolve the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware to parse JSON requests
app.use(express.json());  // Add this line
app.use(express.urlencoded({ extended: true })); // Optional: Parses form data

// Enable CORS
app.use(cors()); // If your frontend is hosted separately, CORS might be required

// Serve static files from the client build folder (absolute path)
app.use(express.static(path.resolve(__dirname, '../client/dist')));

// Import routes
import routes from './routes/index.js';

// Use routes for API and other routes
app.use(routes);

// Serve index.html for all other routes (for single-page apps)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});