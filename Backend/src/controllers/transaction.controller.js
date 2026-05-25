import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";

export const createTransaction = (req, res) => {
    const { sender, reciever, amount, idempotencyKey } = req.body;

    if (!sender || !reciever || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Some required fields are missing, cannot proceed!' });
    }

    try {
        // check if data is valid
        const senderAccount = accountModel.findOne({ _id: sender });
        const recieverAccount = accountModel.findOne({ _id: reciever });

        if (!senderAccount) {
            return res.status(400).json({ message: 'Sender account not found!' });
        }
        if (!recieverAccount) {
            return res.status(400).json({ message: 'Reciever account not found!' });
        }

        // check for duplicate transactions
        const isTransactionRunning = transactionModel.findOne({ 
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
        
    }
    catch (error) {
        console.error('Error creating transaction: ', error);
        return res.status(500).json({ message: 'Please try again' });
    }
}