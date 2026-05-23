/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('MongoDB URI is not defined in environment variables');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI)
    .then( () => {
        console.log('Database connected successfully!');
    })
    .catch( (error) => {
        console.error('Database connection error:', error.message);
        process.exit(1);
    });
}

export default connectDB;