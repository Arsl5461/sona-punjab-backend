import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import adminRoute from './router/adminRouter.js';
import bannerRouter from './router/bannerRouter.js';
import pigeonOwnerRouter from './router/pigeonOwnerRouter.js';
import resultRouter from './router/resultRouter.js';
import tornamentRouter from './router/tornamentRouter.js';
import clubRouter from './router/clubRouter.js';
import headlineRouter from './router/headlineRouter.js';
import connectDB from './config/db.js'; // Ensure correct path and .js extension
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

connectDB();

const app = express();

// Parse JSON and URL-encoded form bodies (e.g. Form Data → x-www-form-urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors("*"))

// Define routes
app.use("/sona-punjab", adminRoute);
app.use("/sona-punjab", tornamentRouter);
app.use("/sona-punjab", bannerRouter);
app.use("/sona-punjab", pigeonOwnerRouter);
app.use("/sona-punjab", resultRouter);
app.use("/sona-punjab", clubRouter);
app.use("/sona-punjab", headlineRouter);

// API documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// app.use(express.static(path.join(process.cwd(), 'build')));
//app.get('*', (req, res) => {
  //res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
//}


// Catch-all route for React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
// });
// Simple route for testing
//app.get('/', (req, res) => {
  //res.send('Hello, World!');
//}
//   app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname,'/build', 'index.html'));
//  });
// Simple route for testing
//app.get('/', (req, res) => {
 // res.send('Hello, World!');
//});

const port = process.env.PORT || 5005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
