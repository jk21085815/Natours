const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// import { htmlToText } from 'html-to-text';



module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.SENDGRID_FROM;
    }

    newTransporter(){
        if(process.env.NODE_ENV === 'production'){
            //Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth:{
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            post: process.env.EMAIL_PORT,
            auth: {
                user:process.env.EMAIL_NAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject){
        //1)render HTML base template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        })
        //2)defind the mail options
        const mailOptions={
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        //3)create a tranpost and send mail
        await this.newTransporter().sendMail(mailOptions)

    }
    async sendWelcome(){
       await this.send('welcome', 'Weolcome to The Natours Family!')
    }
    async sendPasswordReset(){
        await this.send('passReset', 'Your password reset token valid for 10 min')
    }
}

// const { options } = require('../routes/userRoutes')

