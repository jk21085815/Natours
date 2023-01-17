import axios from "axios";
import { showAlert } from "./alert";

/* eslint-disable */


export const singUp = async (name, email, password, passwordConfirm) => {
    try{
    const res = await axios({
        method: 'POST',
        url: '/api/v1/users/signup',
        data:{
            name,
            email,
            password,
            passwordConfirm
        }
    });
    if(res.data.status === 'success'){
        showAlert('success','Sing up successfully!!!!');
        window.setTimeout(()=>{
            location.assign('/me')
        }, 1500)
    }
    }catch(err){
    showAlert('error',err.response.data.message)
    }
};

