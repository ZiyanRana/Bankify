import app from './src/app.js';
import { PORT, NODE_ENV } from './src/config/env.js';
import connectDB from './src/config/db.js';

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();