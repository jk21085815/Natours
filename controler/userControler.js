const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');
const factory = require('./handelerFactory');
const sharp = require('sharp')
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) =>{
//         cb(null, 'public/img/users');
//     },
//     filename:(req, file, cb) =>{
//         // user-id-time-.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.User.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image, Please upload only images.', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserphoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async(req, res, next) =>{
    if(!req.file) return next();

    req.file.filename = `user-${req.User.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)
    return next();
});


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el]=obj[el]
        }
    })
    return newObj
}

exports.getMe = (req, res, next) => {
    req.params.id = req.User.id;
    next();  
}

exports.updateMe = catchAsync(async(req, res, next) => {
    //1)Create error if user try to update password
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route is not for password Update please use / updateMyPassword", 400))
    }
    
    //2)Update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file){
        filteredBody.photo = req.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(req.User.id, filteredBody, {new: true, runValidators: true});
    res.status(200).json({
        status:"success",
        data:{
            user: updatedUser
        }
    });
    
});
exports.deleteMe = catchAsync(async(req, res, next)=>{
    await User.findByIdAndUpdate(req.User.id, {active: false})
    
    res.status(204).json({
        status:'success',
        data: null
    })
})

exports.addusers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "this route is not defined: please use /signup"
    })
}


exports.findUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);