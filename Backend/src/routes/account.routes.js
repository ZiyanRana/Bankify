import { Router } from 'express';
import { getAccount, getUserAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/account.controller.js';

const accountRouter = Router();

// Path: /api/v1/accounts
accountRouter.get('/:accountNumber', getAccount);
accountRouter.get('/user/:userId', getUserAccounts);
accountRouter.post('/', createAccount);
accountRouter.put('/:accountNumber', updateAccount);
accountRouter.delete('/:accountNumber', deleteAccount);