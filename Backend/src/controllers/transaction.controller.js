/* eslint-disable no-unused-vars */
import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";
import ledgerModel from "../models/ledger.model.js";
import { sendTransactionEmail } from "../services/nodemailer.service.js";

export const createTransaction = async (req, res) => {
    const { sender, receiver, amount, idempotencyKey } = req.body;

    if (!sender || !receiver || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Some required fields are missing, cannot proceed!' });
    }

    let session;
    try {
        // check if data is valid
        if (sender === receiver) {
            return res.status(400).json({ message: 'Sender and receiver accounts cannot be the same!' });
        }
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount entered!' });
        }
        const senderAccount = await accountModel.findById(sender);
        const receiverAccount = await accountModel.findById(receiver);

        if (!senderAccount) {
            return res.status(400).json({ message: 'Sender account not found!' });
        }
        if (!receiverAccount) {
            return res.status(400).json({ message: 'Receiver account not found!' });
        }
        if (senderAccount.currency !== receiverAccount.currency) {
            return res.status(400).json({ message: 'Cannot proceed, the sender and receiver accounts have different currencies!' });
        }

        // check for duplicate transactions
        const isTransactionRunning = await transactionModel.findOne({ 
            idempotencyKey: idempotencyKey
        }).select('_id date status');

        if (isTransactionRunning) {
            return res.status(409).json({ 
                message: 'A transaction with the same idempotency key is already in progress!',
                transaction: isTransactionRunning
            });
        }

        // check if accounts are active
        if (senderAccount.status !== 'active') {
            return res.status(400).json({ message: 'Cannot proceed, the sender account is not active!' });
        }
        if (receiverAccount.status !== 'active') {
            return res.status(400).json({ message: 'Cannot proceed, the receiver account is not active!' });
        }

        // check if the sender has enough balance
        const senderBalance = await senderAccount.getBalance();
        if (senderBalance < amount) {
            return res.status(400).json({ message: `Insufficient balance in the sender account. \nYour balance: ${senderBalance}\nTransaction amount: ${amount}!` });
        }

        // create transaction
        session = await mongoose.startSession();
        await session.startTransaction();

        const newTransaction = await transactionModel.create({
            sender,
            receiver,
            amount,
            currency: senderAccount.currency,
            status: 'pending',
            idempotencyKey
        }, { session });

        const debitLedgerEntry = await ledgerModel.create({
            account: sender,
            amount,
            transaction: newTransaction._id,
            type: 'debit'
        }, { session });

        const creditLedgerEntry = await ledgerModel.create({
            account: receiver,
            amount,
            transaction: newTransaction._id,
            type: 'credit'
        }, { session });

        newTransaction.status = 'completed';
        await newTransaction.save({ session });

        await session.commitTransaction();
        await session.endSession();
        
        // Send transaction email
        const senderUser = await userModel.findById(senderAccount.user);
        const reciverUser = await userModel.findById(receiverAccount.user);
        
        await sendTransactionEmail(
            senderUser.email,
            senderUser.username,
            amount,
            'Debit',
            senderAccount.currency,
            newTransaction.date,
            newTransaction.status,
            senderAccount.accountNumber
        );
        
        await sendTransactionEmail(
            reciverUser.email,
            reciverUser.username,
            amount,
            'Credit',
            senderAccount.currency,
            newTransaction.date,
            newTransaction.status,
            receiverAccount.accountNumber
        );

        return res.status(200).json({
            success: true,
            transaction: newTransaction
        });
    }
    catch (error) {
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        console.error('Error creating transaction: ', error);
        return res.status(500).json({ message: 'Please try again' });
    }
}