const express = require('express');

const tourControler = require('./../controler/tourControler')

const router = express.Router();

const authControler = require('./../controler/authControler');
// const reviweControler = require('./../controler/reviewcontroler');
const reviewRouter = require('./../routes/reviewRouts')

router.use('/:tourId/reviews', reviewRouter);
// router.param('id', tourControler.checkID);


//create a check body middeleware 
// check that body contain name and price property
// if not send back 400 request
// add it to post handeler stack 
router
.route('/top-5-cheap')
.get(tourControler.aliasTopTours, tourControler.getAllTours);

router
.route('/tour-stats')
.get(tourControler.getTourStats);

router
.route('/monthly-plane/:year')
.get(authControler.protect, authControler.restrictTo('admin', 'lead-guide', 'guide'),tourControler.getMonthlyPlan);

router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourControler.getTourWithin);
// /tours-distance?distance=123&center=12,12&unit=km 
router
.route('/distances/:latlng/unit/:unit')
.get(tourControler.getDistances)

router
.route('/')
.get(tourControler.getAllTours)
.post(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourControler.addTours);


router
.route('/:id')
.get(tourControler.findTour)
.patch(authControler.protect,authControler.restrictTo('admin', 'lead-guide'),tourControler.uploadTourImages, tourControler.resizeTourImages,tourControler.updateTour)
.delete( authControler.protect,authControler.restrictTo('admin', 'lead-guide'),tourControler.deleteTour);


// router
// .route('/:tourId/reviews')
// .post(authControler.protect, authControler.restrictTo('user'), reviweControler.createReview)

module.exports = router;