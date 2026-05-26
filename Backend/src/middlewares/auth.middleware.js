import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import blackListModel from "../models/blackList.model.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing!' });
    }

    try {
        const blackListed = await blackListModel.findOne({ token });
        if (blackListed) {
            return res.status(401).json({ message: 'Unauthorized, token cannot be used anymore!' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized, invalid token!' });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized, user not found!' });
        }

        req.user = user;

        next();

    }
    catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized, invalid token!' });
    }
}

export const authSystemMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing!' });
    }

    try {
        const blackListed = await blackListModel.findOne({ token });
        if (blackListed) {
            return res.status(401).json({ message: 'Unauthorized, token cannot be used anymore!' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'User unauthorized, invalid token!' });
        }

        const user = await userModel.findById(decoded.userId).select('+systemUser');
        if (!user) {
            return res.status(401).json({ message: 'User associated with the token is not found!' });
        }

        if (!user.systemUser) {
            return res.status(401).json({ message: 'User is not a system user!' });
        }

        req.user = user;

        return next();
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'User unauthorized, invalid token!' });
    }
}