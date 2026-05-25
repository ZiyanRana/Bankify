import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'The sender account is required for the transaction!'],
        index: true
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'The reciever account is required for the transaction!'],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for the transaction'],
        min: [0, 'Amount cannot be negative!']
    },
    currency: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed', 'reversed'],
            message: 'Transaction status must be either pending, completed, failed, or reversed!',
        },
        default: 'pending'
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required for the transaction'],
        unique: true,
        index: true
    }
}, { timestamps: true });

const transactionModel = mongoose.model('Transaction', transactionSchema);

export default transactionModel;