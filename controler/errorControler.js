const AppError = require("./../utils/appErr");

const handleCastErrorDB = err => {
    const message= `invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 404)
}
const handleJWTError = err => {
   return new AppError("Invalid token please log in again!", 401)
}

const handleDuplicateFieldsDB = err => {
    
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate fields value: ${value}, please use onother value`
    return new AppError(message, 404);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(val => val.message)
    const message =`invalid input data ${errors.join('. ')}.`;
    return new AppError(message, 404);
}

const sendErrorDev = (err, req,res) => {
    if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
        status : err.status,
        error: err,
        message : err.message,
        stack: err.stack
    })
    }
    return res.status(err.statusCode).render('error',{
        title: 'something went wrong',
        msg: err.message
    })
}
const senderrorProd = (err, req,res) => {
    // Operational error, trusted error: send message to client
    if(req.originalUrl.startsWith('/api')){

        if( err.isOperational){
        return res.status(err.statusCode).json({
                status : err.status,
            // error: err,
                message : err.message,
            // stack: err.stack
        })}
        //Programming or other error: don't leak error details
        
            //log error
        console.error("Error", err);
    
            //send general message 
        res.status(500).json({
            status: "error",
            message: `Something went wrong! ${err.message}`
        })
        
    }
    if( err.isOperational){
        return res.status(err.statusCode).render('error',{
            title: 'something went wrong',
            msg: err.message
        })
    }
    return res.status(err.statusCode).render('error',{
    title: 'something went wrong',
    msg: 'Please tyr again later'
    })
    
}



module.exports=(err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error"
    if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err, req,res)
    } else if (process.env.NODE_ENV === 'production'){

        if (err.name === "CastError") err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === "ValidationError") err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
        senderrorProd(err, req,res)
    }
}