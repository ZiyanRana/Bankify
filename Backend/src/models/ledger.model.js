import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjetId,
        ref: 'Account',
        required: [true, 'Account is required for logging!'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for logging!'],
        min: [0, 'Amount cannot be negative!'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction is required for logging!'],
        index: true,
        immutable: true
    },
    date: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['credit', 'debit'],
            message: 'Transaction type must be either credit or debit!'
        },
        required: [true, 'Transaction type is required for logging!'],
        immutable: true
    }
}, { timestamps: true });

const preventLedgerModification = () => {
    throw new Error('Ledger entries cannot be modified or deleted after creation!');
}

ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);

const ledgerModel = mongoose.model('Ledger', ledgerSchema);

export default ledgerModel;