const express = require('express');
const bookingControler = require('./../controler/bookingControler');
const authControler = require('./../controler/authControler');
const { route } = require('./viewRoutes');

const router = express.Router();

router.use(authControler.protect)

router.get('/checkout-session/:tourId', bookingControler.getChekOutSession);

router.use(authControler.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingControler.getAllBooking).post(bookingControler.createBooking);
router.route('/:id').get(bookingControler.getBooking).patch(bookingControler.updateBooking)
.delete(bookingControler.deleteBooking);
module.exports = router