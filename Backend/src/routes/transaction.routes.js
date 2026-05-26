import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const transactionRouter = Router();

// Path: /api/v1/transactions
transactionRouter.post('/', authMiddleware, createTransaction);

export default transactionRouter;