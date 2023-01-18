// const { json } = require('express');
const express = require('express');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSenitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const compression = require('compression');

const globleErrorHandler = require('./controler/errorControler')
// const AppError = require('./utils/appErr')
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const path = require('path')
const reviewRouter = require('./routes/reviewRouts');
const bookingRouter = require('./routes/bookingRoutes');
const bookingControler = require('./controler/bookingControler')
// const { base } = require('./models/tourModel');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');//templet engine
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(`${__dirname}/public`));
//Set security HTTP headers
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      },
    })
);
//after helmet
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             scriptSrc: ["'self'", "unpkg.com"],
//             styleSrc: ["'self'", "cdnjs.cloudflare.com"],
//             // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//           }
//     })
// );
// middlewares//
if(process.env.NODE_ENV === 'development'){
    app.use(morgan("dev"));
    
}

//Limit request from same Api
const limiter = rateLimit({
    max:100,
    windowMs:60 * 60 * 100,
    message: 'too many request from this IP, please try again in an hour!' 
});
app.use( '/api' ,limiter);

app.post('/webhook',express.raw({type: 'application/json'}) ,bookingControler.webhookCheckout)
//Body parser, reading data from the body into req.body
app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true, limit: '10kb'}))
app.use(cookieParser());

//Data sanitization against NoSQl query injection
app.use(mongoSenitize());
// app.use((req, res, next) => {
//     res.set(
//       'Content-Security-Policy',
//       'connect-src *'
//     );
//     next();
// });

//data sanitization against xss
app.use(xss());

//preventing parameter pillution
app.use(hpp({
    whitelist:["ratingsAverage" , "ratingsQuantity", "startDates", "duration", "maxGroupSize", "difficulty", "price"]
}))

var cors = require('cors');
const { json } = require('express');

app.use(cors()) // Use this after the variable declaration


//Serving static files

// app.use((req,res,next)=>{
//     console.log('Hello from the middleware');
//     next();
// });

app.use(compression())
// test middleware
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/', viewRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter)

// app.all('*', (req,res,next) => {
//     // res.status(404).json({
//     //     status:'fail',
//     //     message: `can't find ${req.originalUrl} on this server`
//     // });
//     // const err = new Error(`can't find ${req.originalUrl} on this server`)
//     // err.status = "fail";
//     // err.statusCode = 404;

//     next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
// });

app.use(globleErrorHandler)


module.exports=app;
