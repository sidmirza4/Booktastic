const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cloudinaryConfig = require('./config/cloudinaryConfig');
const bookRouter = require('./routes/bookRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// enabling trust proxy
app.enable('trust proxy');

// DOTENV
dotenv.config({ path: './.env' });

// DATABASE SETUP
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

// global middlewares
app.use(cors());
// https://expressjs.com/en/resources/middleware/cors.html
app.options('*', cors());
app.use(helmet());

// api request limiter
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message:
		'Too many requests from this IP , please try again after some time',
});
app.use('/api', limiter);

app.use(cloudinaryConfig);
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(
	hpp({
		whitelist: [
			'ratingsCount',
			'ratingsAverage',
			'title',
			'authors',
			'page',
			'limit',
			'publishYear',
			'publisher',
			'isbn',
		],
	})
);

app.use(compression());

// ROUTER
app.use('/api/books', bookRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
