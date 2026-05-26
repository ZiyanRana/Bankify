import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { sendRegistrationEmail } from '../services/nodemailer.service.js';
import blackListModel from '../models/blackList.model.js';
import bcrypt from 'bcrypt';

export const signUp = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Some user credential is missing!' });
    }

    const existingName = await userModel.findOne({ username });
    if (existingName) {
        return res.status(400).json({ message: 'Cannot register, username is already taken!' });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ message: 'Cannot register, email is already taken!' });
    }

    try {
        const newUser = await userModel.create({ username, email, password });

        const token = jwt.sign({userId: newUser._id}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.cookies('token', token, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseInt(JWT_EXPIRES_IN) * 1000
        });

        res.status(201).json({ 
            success: true,
            message: 'User account created successfully!',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

        await sendRegistrationEmail(newUser.email, newUser.username);
    }
    catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while creating the user account, please try again!',
            error: error.message
        });
    }
}

export const signIn = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        return res.status(400).json({ message: 'Email or username is needed for login!' });
    }

    try {
        const user = await userModel.findOne({
            $or: [
                { username: username || null },
                { email: email || null }
            ]
        }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password not provided!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect password entered!' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.cookies('token', token, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseInt(JWT_EXPIRES_IN) * 1000
        });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while signing in, please try again!',
            error: error.message
        });
    }
}

export const signOut = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ message: 'Cannot sign out. No user is currently signed in!' });
        }

        await blackListModel.create({ token });

        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'User signed out successfully!'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while signing out, please try again!',
            error: error.message
        });
    }
}