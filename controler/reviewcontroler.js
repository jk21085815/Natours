const AppError = require('../utils/appErr');
const Review = require('./../models/reviewModel');
const factory = require('./handelerFactory');
// const catchAsync = require('./../utils/catchAsync');


exports.setTourUserIds = (req, res, next)=>{
    if(!req.body.tour){req.body.tour = req.params.tourId};
    if(!req.body.user){req.body.user = req.User.id};
    if(!req.body.review || !req.body.rating){
        next(new AppError("Please type a review and rating",400))
    }
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReviews = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);