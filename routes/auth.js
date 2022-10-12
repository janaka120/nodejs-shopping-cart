const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email'),
    body('password', 'Please enter password with only numbers and text and at least 5 characters').isLength({min: 5}).isAlphanumeric()
], authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom((value, {req}) => {
            return User.findOne({email: value})
                .then(user => {
                    if(user) {
                        return Promise.reject('Email exists already, please pick a diffrent one')
                    }
                })
        })
        .normalizeEmail(),
    body('password', 'Please enter password with only numbers and text and at least 5 characters')
        .isLength({min: 5})
        // .withMessage('Please enter password with only numbers and text and at least 5 characters')
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
        if(req.body.password !== value) {
            throw new Error('Password have to match!')
        }
        return true
    })
    ], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);


module.exports = router;