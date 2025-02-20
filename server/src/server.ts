import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// This is necessary to resolve the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the client build folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes or any other routes
import routes from './routes/index.js'; // Ensure correct path for ES modules
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});