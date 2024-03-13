import express from 'express';
import router from './api/routes/v1/index.mjs';
import { connectDatabase } from './utils/mongo-connector.mjs';
import { demoFormSeed } from './api/controllers/form.controller.mjs';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

connectDatabase();

demoFormSeed(); // calling demo form seed to set the mock data in the server DB

app.use('/v1/api/', router);

app.listen(PORT);

export default app;