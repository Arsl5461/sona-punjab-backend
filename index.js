import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoute from './router/adminRouter.js';
import bannerRouter from './router/bannerRouter.js';
import pigeonOwnerRouter from './router/pigeonOwnerRouter.js';
import resultRouter from './router/resultRouter.js';
import tornamentRouter from './router/tornamentRouter.js';
import clubRouter from './router/clubRouter.js';
import connectDB from './config/db.js'; // Ensure correct path and .js extension
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Load environment variables from .env file
dotenv.config();
connectDB();

const app = express();

// Parse JSON payloads
app.use(express.json());

app.use(cors("*"))

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(uploadsDir));

// Define routes
app.use("/sona-punjab", adminRoute);
app.use("/sona-punjab", tornamentRouter);
app.use("/sona-punjab", bannerRouter);
app.use("/sona-punjab", pigeonOwnerRouter);
app.use("/sona-punjab", resultRouter);
app.use("/sona-punjab", clubRouter);

// API documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.use(express.static(path.join(process.cwd(), 'build')));
//app.get('*', (req, res) => {
  //res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
//}


// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});
// Simple route for testing
//app.get('/', (req, res) => {
  //res.send('Hello, World!');
//}
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname,'/build', 'index.html'));
 });
// Simple route for testing
//app.get('/', (req, res) => {
 // res.send('Hello, World!');
//});

const port = process.env.PORT || 5005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
