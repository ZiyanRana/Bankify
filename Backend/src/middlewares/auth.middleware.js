import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing!' });
    }

    try {
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

export default authMiddleware;