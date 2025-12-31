import express from 'express';
import routes from './routes/index';
import { errorHandler } from './util/errorHandler';

const app = express();
app.use(express.json());
app.use('/api', routes); // Prefix all with /api
app.use(errorHandler);

export default app;