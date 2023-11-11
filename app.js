require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const connectDb = require('./db/connectDb');

const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/handler-errors');

const authRouter = require('./route/authRoute');
const userRouter = require('./route/userRoute');
const songRouter = require('./route/songRoute');
const commentRouter = require('./route/commentRoute');
const playlistRouter = require('./route/playlistRoute');
const albumRouter = require('./route/albumRoute');


app.set('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60
}));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload({ useTempFiles: true }));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/song', songRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/album', albumRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDb(process.env.MONGODB_URL);
        app.listen(port, () => {
            console.log(`Listen on ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
};

start();