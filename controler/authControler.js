const User = require('./../models/userModel');
const util = require('util');
const JWT = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');
const Email = require("../utils/email");
const crypto = require('crypto');

const signToken = id => {
    return JWT.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOption = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000)),
    httpOnly: true,
    secure: false
    };
    
    if(process.env.NODE_ENV === "production"){
        cookieOption.secure = true
    }
    res.cookie('JWT', token, cookieOption);  
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signup = catchAsync (async (req, res, next) =>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role:req.body.role

    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});


exports.login =catchAsync( async(req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    //1)Chek if email and password exit
    if(!email || !password){
       return next(new AppError("Please provide email and passeord", 404));
    }

    //2)Chek if user exit and password is correct
    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("Incorrect email or password", 401))
    }

    //3)If everthing is ok send json webtoken to client

    createSendToken(user, 200, res);
});

exports.logOut = (req, res)=>{
    res.cookie('JWT', 'loggedout', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({
        status:'success'
    })
}

exports.protect = catchAsync(async(req, res, next) => {
    //1)Getting token and chek if it's there
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(' ')[1];
        //  console.log(token);
    }else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    if(!token){
        return next(new AppError("You are not logged in! please log in to get access.", 401))
    };

    //2)validate the token
    const decoded = await util.promisify(JWT.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded)


    //3)chek user is still exists
    const currentUser = await User.findById(decoded.id);
    // console.log(currentUser);
    if(!currentUser) {
        return next(new AppError("The user belonging to this token does no longer exit", 401))
    }

    //4)if user change password aftert JWT is exist
    // console.log(decoded.iat)
    // try{
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently change password please login again", 401))
    };
    // }catch(err){console.log(err)}
    req.User = currentUser;
    res.locals.user = currentUser;
    next();
});


//Only for rendered pages, no error
exports.isLoggedin = async(req, res, next) => {
    try{
    if(req.cookies.JWT){
        //1) verify token
        const decoded = await util.promisify(JWT.verify)(req.cookies.JWT, process.env.JWT_SECRET);

        //2)chek user is still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next()
        }

        if(currentUser.changedPasswordAfter(decoded.iat)){
            return next()
        };
        
        //3)there is a logged in user
        res.locals.user = currentUser;
        return next();
    }}catch(err){
        return next();
    }
    next()
};


exports.restrictTo = (...roles) => {
    return function(req,res,next){
        // console.log(...roles)
        // roles in an array in this case roles["admin", "lead-guide"]
        if(!roles.includes(req.User.role)){
            // console.log(req.User.role);
            return next(new AppError("you do not have permission to perform this action", 403))
        }
        next();
    }
}

exports.forgotPassword =  catchAsync(async(req, res, next) => {
    //1) Get user based on posted email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError("There is no user with email address", 404));
    }

    //2)generate the random reset token 
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    //3) send it to user's email
    try{
    const resetURL =  `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    })}catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        // console.log(err)
        return next(new AppError("There was an error sending the email, please try again later", 500))
    }
})
exports.resetPassword = catchAsync( async (req, res, next) => {
    //1)get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt:Date.now()}});
    //2) if token is not expired and there is a user, set the new password
    if(!user){
        return next(new AppError("Token is invalid or has expired", 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken= undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    //3)update changeChangePasswordAt property for the user
    //4)Log the user in, sens JWT
    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync(async(req, res, next)=>{
    //1)Get user from collection
    // console.log(req.User);
    const user = await User.findById(req.User.id).select('+password');

    //2)chek password is currect
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError("Your current password in wrong", 401))
    }

    //3)update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4)log user in, send JWT
    createSendToken(user, 200, res);
})

