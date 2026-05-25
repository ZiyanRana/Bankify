import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import accountRouter from './routes/account.routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/accounts', accountRouter);

export default app;