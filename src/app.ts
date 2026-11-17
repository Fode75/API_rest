import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import healthRouter from './routers/healthRouter';
import helloRouter from './routers/helloRouter';
import apiRouter from './routers';
import { env } from './utils/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.use('/', helloRouter);
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// Toujours en dernier.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
