const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const cloudinaryConfig = require('./config/cloudinaryConfig');
const bookRouter = require('./routes/bookRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// DOTENV
dotenv.config({ path: './.env' });

// DATABASE SETUP
const dbUrl = process.env.DB_URL;
mongoose
	.connect(dbUrl, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => console.log('Successfully connected to DB'));

// cloudinary config middleware
app.use(cloudinaryConfig);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTER
app.use('/api/books', bookRouter);
app.use('/api/users', userRouter);

module.exports = app;
