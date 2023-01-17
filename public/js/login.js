import axios from "axios";
import { showAlert } from "./alert";

/* eslint-disable */


export const login = async (email, password) => {
    try{
    const res = await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data:{
            email,
            password
        }
    });
    if(res.data.status === 'success'){
        showAlert('success','Logged in successfully!!!!');
        window.setTimeout(()=>{
            location.assign('/')
        }, 1500)
    }
    }catch(err){
    setTimeout(showAlert('error',err.response.data.message), 1500)
    }
};

