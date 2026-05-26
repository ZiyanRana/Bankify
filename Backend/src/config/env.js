/* eslint-disable no-undef */
import { config } from 'dotenv';

config({
    path: `.env.${process.env.NODE_ENV}`
});

export const {
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
    MONGO_URI,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    EMAIL_USER
} = process.env;