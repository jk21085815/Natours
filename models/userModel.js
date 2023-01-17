const crypto = require("crypto");
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Userschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please type your name "]
        },
        email: {
            type: String,
            required:[true, "Please type your email"],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valide email']
        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user'
          },
          password: {
          type: String,
          required:[true, "Please provide a password"],
            minlength:[8, "Please inter at-least 8 char."],
            select: false
        },
        passwordConfirm:{
            type: String,
            required:[true, "Please provide a password"],
            // minlength:[8, "Please inter at-least 8 char."],
            validate: {
                //This is only works on CREATE and SAVE!!!
                validator: function(el){
                    return el === this.password;
                },
                message: "Password are not same "
            }
        },
        passwordChangedAt:Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active:{
            type: Boolean,
            default: true,
            select: false
        }
    }
)

Userschema.pre('save', async function(next){
    //this finction is only run when password is modified
    if(!this.isModified('password')) return next();

    //Hash the passwors with cost with 12
    this.password = await bcrypt.hash(this.password, 12)

    //delete passwordConfirm feild
    this.passwordConfirm = undefined;
    next();
});

Userschema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next()
    
    this.passwordChangedAt = Date.now() - 1000;
    next()
});

Userschema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next()
});

Userschema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

Userschema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(changeTimestamp, JWTTimeStamp)
        return JWTTimeStamp < changeTimestamp;
    }
    //false means no change 
    return false;
}

Userschema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10*60*1000;

   return resetToken;
};
// Userschema.methods.reset12 = function(){
//     this.password = req.body.password;
//     this.passwordConfirm = req.body.passwordConfirm;
//     this.passwordResetExpires = undefined;
//     this.passwordResetToken = undefined;
// };

const User = mongoose.model('User', Userschema);
module.exports = User;