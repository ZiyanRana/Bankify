import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use('/api/v1/auth', authRouter);

export default app;