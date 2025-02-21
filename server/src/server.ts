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
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Optional: Parses form data

// ✅ Enable CORS (useful if frontend is hosted separately)
app.use(cors());

// ✅ Serve static files from the client `dist` folder
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

console.log(`Serving static files from: ${clientDistPath}`);

// ✅ Import API routes
import routes from './routes/index.js';
app.use(routes);

// ✅ Serve `index.html` for all non-API routes (SPA support)
app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    console.log(`Attempting to serve index.html from: ${indexPath}`);

    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error(`Error serving index.html: ${err.message}`);
    
            // ✅ Ensure 'status' property exists before accessing it
            const statusCode = (err as { status?: number }).status || 500;
    
            res.status(statusCode).send('Error serving frontend');
        }
    });
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});