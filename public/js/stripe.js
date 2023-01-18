import axios from "axios"
import Stripe from "stripe";
import { showAlert } from "./alert";


const stripe = Stripe('sk_test_51MPIp6SHSjHj3dM2RJiHFPvp2lqjZDXNBuZBm33tu9FTpcps5EoOAcvswTp3svPMIYGxtYBCKg3sbUMSYsWCvR6a00BNjmytYY')


export const bookTour = async tourId => {
    try{

        
        //1)get chek out session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
    
        //2) create chekout for + charge credit card 
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // })
        console.log(session)
        // window.location.replace(session.data.session.url);
    }catch(err){
        showAlert('error', err);
    }


}