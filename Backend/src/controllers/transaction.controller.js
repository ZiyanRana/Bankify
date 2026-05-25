import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";

export const createTransaction = (req, res) => {
    const { sender, reciever, amount, idempotencyKey } = req.body;

    if (!sender || !reciever || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Some required fields are missing, cannot proceed!' });
    }

    const senderAccount = accountModel.findOne({ _id: sender });
    const recieverAccount = accountModel.findOne({ _id: reciever });

    if (!senderAccount) {
        return res.status(400).json({ message: 'Sender account not found!' });
    }
    if (!recieverAccount) {
        return res.status(400).json({ message: 'Reciever account not found!' });
    }

    const isTransactionRunning = transactionModel.findOne({ 
        idempotencyKey: idempotencyKey
    });

    if (isTransactionRunning) {
        return res.status(409).json({ 
            message: 'A transaction with the same idempotency key is already in progress!',
            transaction: isTransactionRunning
         });
    }
}