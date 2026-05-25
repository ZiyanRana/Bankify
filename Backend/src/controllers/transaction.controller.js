import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";
import ledgerModel from "../models/ledger.model.js";

export const createTransaction = async (req, res) => {
    const { sender, reciever, amount, idempotencyKey } = req.body;

    if (!sender || !reciever || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Some required fields are missing, cannot proceed!' });
    }

    try {
        // check if data is valid
        const senderAccount = await accountModel.findById({ sender });
        const recieverAccount = await accountModel.findById({ reciever });

        if (!senderAccount) {
            return res.status(400).json({ message: 'Sender account not found!' });
        }
        if (!recieverAccount) {
            return res.status(400).json({ message: 'Reciever account not found!' });
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
        if (recieverAccount.status !== 'active') {
            return res.status(400).json({ message: 'Cannot proceed, the reciever account is not active!' });
        }

        // check if the sender has enough balance
        const senderBalance = await senderAccount.getBalance();
        if (senderBalance < amount) {
            return res.status(400).json({ message: `Insufficient balance in the sender account. \nYour balance: ${senderBalance}\nTransaction amount: ${amount}!` });
        }

        // create transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newTransactions = await transactionModel.create({
                sender,
                reciever,
                amount,
                currency: senderAccount.currency,
                status: 'pending',
                idempotencyKey
            }, { session });

            const newTransaction = newTransactions[0];

            const debitLedgerEntry = await ledgerModel.create({
                account: sender,
                amount,
                transaction: newTransaction._id,
                type: 'debit'
            }, { session });

            const creditLedgerEntry = await ledgerModel.create({
                account: reciever,
                amount,
                transaction: newTransaction._id,
                type: 'credit'
            }, { session });

            newTransaction.status = 'completed';
            await newTransaction.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                transaction: newTransaction
            });
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error processing transaction: ', error);
            return res.status(500).json({ message: 'Transaction failed, please try again!' });
        }
    }
    catch (error) {
        console.error('Error creating transaction: ', error);
        return res.status(500).json({ message: 'Please try again' });
    }
}