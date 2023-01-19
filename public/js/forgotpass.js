import axios from "axios";
import { showAlert } from "./alert";

export const forgotPass = async(email) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        })
        if(res.data.status === 'success'){
            showAlert('success','Mail sent successfully');
            window.setTimeout(()=>{
                location.assign('/')
            }, 1500)
        }
    }catch(err){
        if(err.message === 'Request failed with status code 404'){
            showAlert('error', 'There is no user with email address')
            window.setTimeout(()=>{
                location.assign('/forgotPassword')
            }, 2000)
        }else{
            showAlert('error', 'Something went wrong please try again later');
            window.setTimeout(()=>{
                location.assign('/forgotPassword')
            }, 2000)
        }
    }
}