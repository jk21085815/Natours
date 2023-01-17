const express = require('express');

const userControler = require('./../controler/userControler');
const authrControler = require('./../controler/authControler');


const router = express.Router();

router.post('/signup', authrControler.signup);
router.post('/login', authrControler.login);
router.get('/logout', authrControler.logOut);
router.post('/forgotPassword', authrControler.forgotPassword);
router.patch('/resetPassword/:token', authrControler.resetPassword);

router.use(authrControler.protect);

router.patch('/updateMyPassword', authrControler.updatePassword);
router.get('/me', userControler.getMe, userControler.findUser)
router.patch('/updateMe', userControler.uploadUserphoto, userControler.resizeUserPhoto,userControler.updateMe);
router.delete('/deleteMe', userControler.deleteMe);

router.use(authrControler.restrictTo('admin'));

router
.route('/')
.get(userControler.getAllUsers)
.post(userControler.addusers);

router
.route('/:id')
.get(userControler.findUser)
.patch(userControler.updateUser)
.delete(userControler.deleteUser);




module.exports = router;