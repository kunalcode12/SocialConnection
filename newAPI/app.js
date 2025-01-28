const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const contentRouter = require('./routes/contentRoutes');
const voteRouter = require('./routes/voteRoutes');
const flaggedRoutes = require('./routes/flaggedRoutes');
const commentsRouter = require('./routes/commentRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const searchRoutes = require('./routes/searchRoutes');
const AppError = require('./utils/appError');
const app = express();
const globalErrorHandler = require('./controllers/errorController');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/content', contentRouter);
app.use('/api/v1/votes', voteRouter);
app.use('/api/v1/flagged', flaggedRoutes);
app.use('/api/v1/comment', commentsRouter);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/searching', searchRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
