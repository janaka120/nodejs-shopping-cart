const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn,
      });
}

exports.postLogin = (req, res, next) => {
     // ** This code used mongoose to retrive data
     User.findById('63417225f04f3695f002433c').then(user => {
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save(err => {
            if(err) {
                console.log("session save err >>>", err);
            }
            res.redirect('/');
        })
        // res.render('auth/login', {
        //     pageTitle: 'Login',
        //     path: '/',
        //     isAuthenticated: req.session.isLoggedIn,
        // });
    }).catch(err => {
        console.log("error get user >>>", err);
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