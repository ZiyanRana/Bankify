import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';

const transactionRouter = Router();

// Path: /api/v1/transactions
transactionRouter.post('/', createTransaction);

export default transactionRouter;