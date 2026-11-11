require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const httpStatusText = require('./utils/httpServerText');
const coursesRouter = require('./routes/courses.rout');
const usersRouter = require('./routes/user.rout');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/courses', coursesRouter);
app.use('/api/users', usersRouter);

app.all('*', (req, res) => {
    res.status(404).json({ status: httpStatusText.ERROR, message: 'this Resource is not available' });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: error.statusText || httpStatusText.ERROR,
        message: error.message,
        data: null,
    });
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(PORT, () => console.log(`listening on port ${PORT}`));
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });