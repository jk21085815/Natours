const reviewControler = require('../controler/reviewcontroler');
const express = require('express');
const authControler = require('./../controler/authControler');

const router = express.Router({mergeParams: true});

router.use(authControler.protect);

router.route('/')
.get(reviewControler.getAllReviews)
.post(authControler.restrictTo('user'),reviewControler.setTourUserIds,reviewControler.createReview);

router.route('/:id')
.get(reviewControler.getReviews)
.delete(authControler.restrictTo('user', 'admin'),reviewControler.deleteReview)
.patch(authControler.restrictTo('user', 'admin'),reviewControler.updateReview)


module.exports = router;