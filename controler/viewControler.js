const Tour = require('./../models/tourModel');
const User = require('./../models/userModel')
const Booking = require('./../models/bookingModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');

exports.getOverview = catchAsync(async(req , res, next)=>{
    //1)get tour data from the collection
    const tours = await Tour.find();

    //2)Build template
    //3)render that template using tour data [1]
    res.status(200).render('overview',{
     title:'Exciting tours for adventurous people',
     tours: tours
    });
 });

exports.getTours = catchAsync(async(req , res, next)=>{
    //1)get tour from url
    const tour = await Tour.findOne({slug: req.params.tourName}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    
    if(!tour){
        return next(new AppError('there is no tour with that name', 404))
    }
    res.status(200).render('tour',{
        title: `${tour.name} Tour`,
        tour
    });
});

exports.logIn = (req, res, next)=>{
    res.status(200).render('login',{
        title: 'Log into your account'
    })
}

exports.forgotPassword = (req, res, next)=>{
    res.status(200).render('pass',{
        title: 'Forgot Password'
    })
}

exports.singUp = (req, res, next)=>{
    res.status(200).render('singup',{
        title: 'singUp into your account'
    })
}

exports.getAccount = (req, res, next)=>{
    res.status(200).render('account', {
        title: 'My Account'
    })
}

exports.getMyTours = catchAsync(async(req, res, next) => {
    const booking = await Booking.find({user: req.User.id})

    const touriDs = booking.map(el => el.tour);
    const tours = await Tour.find({_id: {$in: touriDs} });

    res.status(200).render('overview',{
        title: 'My tours',
        tours
    });
});

exports.updateUserData = catchAsync(async(req, res, next)=>{
    const updatedUser = await User.findByIdAndUpdate(req.User.id,{
        name: req.body.name,
        email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );
    res.status(200).render('account', {
        title: 'My Account',
        user: updatedUser
    })
})
