const express = require('express');
const viewControler = require('./../controler/viewControler');
const authControler = require('./../controler/authControler');
const bookingControler = require('./../controler/bookingControler');

const router = express.Router();
router.get('/singup', viewControler.singUp);


router.get('/',
// bookingControler.createBookingCheckout 
authControler.isLoggedin,viewControler.getOverview);

router.get('/tour/:tourName' , authControler.protect, viewControler.getTours);

router.get('/login', authControler.isLoggedin,viewControler.logIn);
router.get('/me', authControler.protect,viewControler.getAccount);
router.get('/my-tours', authControler.protect,viewControler.getMyTours);
router.post('/submit-user-data', authControler.protect,viewControler.updateUserData);
module.exports = router