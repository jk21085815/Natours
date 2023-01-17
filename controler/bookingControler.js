const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);
const AppError = require('../utils/appErr');
const User =require('./../models/userModel')
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel')
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handelerFactory');

exports.getChekOutSession =catchAsync( async(req, res, next) => {
    //1) get the cutrrently booked tour
    const tour = await Tour.findById(req.params.tourId);


    //2) create a check out session
    //session information
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.User.id}&price=${tour.price}`,
        success_url:`${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.User.email,
        client_reference_id: req.params.tourId,
        //product information
        display_items:[
            {
                quantity:1,
                price_data:{
                    unit_amount:tour.price * 100,
                    currency: 'usd',
                    product_data:{
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
    
                    },
                },
            }
        ]
    })
    //3)create a session as response
    res.status(200).json({
        status: 'success',
        session
    })
})

// exports.createBookingCheckout =catchAsync( async(req, res, next) =>{
//     const {tour, user, price}= req.query;

//     if(!tour && !user && ! price){
//         return next()
//     }
//     await booking.create({tour, user, price})
    
//     res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.object.amount_total / 100;
    await Booking.create({ tour, user, price });
  };

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event
    try{
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIP_SECRET);
    }catch(err){
        return res.status(400).send(`Webhook error ${err.message}`)
    }

    if(event.type === checkout.session.completed){
        console.log(event.data.object);
        createBookingCheckout(event.data.object);
        res.status(200).json({ received: true });
    }else{
        console.log(`Unhandled event type ${event.type}`);
    }
}
exports.createBooking = factory.createOne(booking);
exports.getBooking = factory.getOne(booking);
exports.getAllBooking = factory.getAll(booking);
exports.updateBooking = factory.updateOne(booking);
exports.deleteBooking = factory.deleteOne(booking);