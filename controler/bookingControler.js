const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);
// const AppError = require('../utils/appErr');
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
        line_items:[
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
    const price = session.line_items[0].price_data.unit_amount;
    await Booking.create({ tour, user, price });
  };

exports.webhookCheckout = (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event
    try{
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIP_SECRET);
    } catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
    }

    if(event.type === checkout.session.completed){
        console.log(event.data.object);
        // const session = event.data.object;
        // createBookingCheckout(session);   
        res.status(200).send(event.data.object);
    }else{
        console.log(`Unhandled event type ${event.type}`);
    }
}
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);