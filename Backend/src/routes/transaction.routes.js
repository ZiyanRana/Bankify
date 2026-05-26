import { Router } from 'express';
import { createTransaction, createInitialFunds } from '../controllers/transaction.controller.js';
import { authMiddleware, authSystemMiddleware } from '../middlewares/auth.middleware.js';

const transactionRouter = Router();

// Path: /api/v1/transactions
transactionRouter.post('/', authMiddleware, createTransaction);
transactionRouter.post('/system/initial-funds', authSystemMiddleware, createInitialFunds);

export default transactionRouter;