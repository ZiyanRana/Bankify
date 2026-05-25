import { Router } from 'express';
import { getAccount, getUserAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/account.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const accountRouter = Router();

// Path: /api/v1/accounts
accountRouter.get('/:accountNumber', authMiddleware, getAccount);
accountRouter.get('/user/:userId', authMiddleware, getUserAccounts);
accountRouter.post('/', authMiddleware, createAccount);
accountRouter.put('/:accountNumber', authMiddleware, updateAccount);
accountRouter.delete('/:accountNumber', authMiddleware, deleteAccount);