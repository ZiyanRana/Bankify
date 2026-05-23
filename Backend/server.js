import app from './src/app.js';
import { PORT, NODE_ENV } from './src/config/env.js';
import connectDB from './src/database/mongodb.js';

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
    });
};

startServer();