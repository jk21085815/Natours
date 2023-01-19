import { login } from "./login";
import { singUp } from "./singup";
import { logout } from "./logout";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
import { forgotPass } from "./forgotpass";
import '@babel/polyfill';

if(document.querySelector('.form--login')){
    document.querySelector('.form--login').addEventListener('submit', e =>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
})};

if(document.querySelector('.forgotpass')){
    document.querySelector('.forgotpass').addEventListener('submit', e =>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPass(email);
})}

if(document.querySelector('.form-user-data')){
    document.querySelector('.form-user-data').addEventListener('submit',e =>{
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value)
        form.append('email',document.getElementById('email').value)
        form.append('photo',document.getElementById('photo').files[0])
        updateSettings(form , 'data');
    })
}

if(document.querySelector('.form-user-password')){
    document.querySelector('.form-user-password').addEventListener('submit',async e=>{
        e.preventDefault();
        document.querySelector('.btn--save-pass').textContent = "Updating....";
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password')
        document.querySelector('.btn--save-pass').textContent = "Save Password"
    });
}


if(document.querySelector('.nav__el--logou')){
    document.querySelector('.nav__el--logou').addEventListener('click', logout)
};

if(document.getElementById('book-tour')){
    document.getElementById('book-tour').addEventListener('click', e=>{
        document.getElementById('book-tour').textContent = 'Processing...';
        const tourId = e.target.dataset.tourId;
        bookTour(tourId);
    })
}

if(document.querySelector('.singUp')){
    document.querySelector('.singUp').addEventListener('submit', e =>{
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        singUp(name, email, password, passwordConfirm);
    })
}