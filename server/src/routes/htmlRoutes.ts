import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Define route to serve index.html
router.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

export default router;