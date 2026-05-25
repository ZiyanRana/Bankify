import accountModel from '../models/account.model.js';

export const getAccount = async (req, res) => {
    const { accountNumber } = req.body;

    try {
        const account = await accountModel.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found!' });
        }

        res.status(200).json({
            success: true,
            account
        })
    }
    catch (error) {
        console.error('Error fetching account: ', error);
        res.status(500).json({ message: 'Please try again' });
    }
}

export const getUserAccounts = async (req, res) => {
    const id = req.params.id;

    try {
        const accounts = await accountModel.find({ user: id });

        res.status(200).json({
            success: true,
            accounts
        })
    }
    catch (error) {
        console.error('Error fetching user accounts: ', error);
        res.status(500).json({ message: 'Please try again' });
    }
}

export const createAccount = async (req, res) => {
    const { accountNumber, status, currency } = req.body;
    const user = req.user._id;

    try {
        const newAccount = await accountModel.create({
            user,
            accountNumber,
            status,
            currency
        });

        res.status(200).json({
            success: true,
            account: newAccount
        })
    }
    catch (error) {
        console.error('Error creating account: ', error);
        res.status(500).json({ message: 'Please try again' });
    }
}

export const updateAccount = async (req, res) => {
    const accountNumber = req.params.accountNumber;
    const { status, currency } = req.body;

    try {
        const account = await accountModel.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found!' });
        }

        if (status) {
            account.status = status
        }
        if (currency) {
            account.currency = currency
        }

        await account.save();

        res.status(200).json({
            success: true,
            account
        })
    }
    catch (error) {
        console.error('Error updating account: ', error);
        res.status(500).json({ message: 'Please try again' });
    }
}

export const deleteAccount = async (req, res) => {
    const accountNumber = req.params.accountNumber;

    try {
        const account = await accountModel.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found!' });
        }

        await account.deleteOne();

        res.status(200).json({
            success: true,
            account
        })
    }
    catch (error) {
        console.error('Error deleting account: ', error);
        res.status(500).json({ message: 'Please try again' });
    }
}