/* eslint-disable no-undef */
import { config } from 'dotenv';

config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const {
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV
} = process.env;