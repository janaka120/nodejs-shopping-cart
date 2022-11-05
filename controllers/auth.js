const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');
const {deleteFile} = require('../util/file');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '' // sendgrid api-key 
    }
}));

exports.getLogin = (req, res, next) => {
    const messages = req.flash('error');
    let message = null;
    if(messages.length > 0) {
        message = messages[0];
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
        },
        validationErrors: [],
      });
}

exports.postLogin = (req, res, next) => {
     // ** This code used mongoose to retrive data
     const email = req.body.email;
     const password = req.body.password;

     const errors = validationResult(req);
     if(!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
        })
    }
     User.findOne({email: email}).then(user => {
        if(user) {
            bcrypt.compare(password, user.password).then(result => {
                if(result) {
                    req.session.user = user;
                    req.session.isLoggedIn = true;
                    req.session.save(err => {
                        if(err) {
                            console.log("session save err >>>", err);
                        }
                        return res.redirect('/');
                    });
                } else {
                    console.log('password not matched');
                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/login');
                }
            }).catch(err => {
                console.log('password check err >>', err);
                return res.redirect('/login');
            })
        }else {
            console.log('user not found');
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }
    }).catch(err => {
        console.log("error get user >>>", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if(err) {
            console.log("logout err >>>", err)
        }else {
            console.log("postLogout successful");
        }
        res.redirect('/')
    });
}

exports.getSignup = (req, res, next) => {
    const messages = req.flash('error');
    let message = null;
    if(messages.length > 0) {
        message = messages[0];
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationErrors: [],
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({email, password: hashedPassword, cart: {items: []}});
            return user.save();
        })
        .then(result => {
            console.log("user created successfully.");
            // ** Error: The from address does not match a verified Sender Identity. ** //
            // solution ==> https://stackoverflow.com/questions/61426610/does-not-match-a-verified-sender-identity-error-in-golang
            // return transporter.sendMail({
            //     to: email,
            //     from: 'shop@node-complete.com',
            //     subject: 'Signup succeeded!',
            //     html: '<h1>You successfully signed up!</h1>'
            // }).then(result => {
            //     res.redirect('/login');
            // }).catch(err => {
            //     console.log("email send error >>", err)
            // })
            res.redirect('/login');
        })
        .catch(err => {
            console.log("postSignup err >>>>", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getReset = (req, res, next) => {
    const messages = req.flash('error');
    let message = null;
    if(messages.length > 0) {
        message = messages[0];
    }
    res.render('auth/reset',{
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log("crypto err", err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email}).then(user => {
            if(!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save(); 
        }).then(result => {
            res.redirect('http://localhost:3000/');
            // ** Error: The from address does not match a verified Sender Identity. ** //
            // solution ==> https://stackoverflow.com/questions/61426610/does-not-match-a-verified-sender-identity-error-in-golang
            // transporter.sendMail({
            //     to: req.body.email,
            //     from: 'shop@node-complete.com',
            //     subject: 'Reset email',
            //     html: `
            //         <p>You requested a password reset</p>
            //         <p>Click this <a href="http://localhost:3000/reset/${token}" ></a> link to set a new password</p>
            //     `
            // });
        })
        .catch(err => {
            console.log('find user err', err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then(user => {
        const messages = req.flash('error');
        let message = null;
        if(messages.length > 0) {
            message = messages[0];
        }
        res.render('auth/new-password',{
            path: '/new-password',
            pageTitle: 'New password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
        
    }).catch(err => {
        console.log('token find error >>', err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId}).then(user => {
        return bcrypt.hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = undefined;
                    user.resetTokenExpiration = undefined;
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log("password err >>>", err);
                })
    }).catch(err => {
        console.log("postNewPassword err >>>", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}