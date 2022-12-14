const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const constants = require('./util/constant');
const errorController = require('./controllers/error');
// const database = require('./util/database'); // used by mongodb
const User = require('./models/user');
const app = express();

const MONGODB_URL = constants.mongoDbUrl; // mongodb url

var store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});

const csrfProtection = csrf();

// Catch errors
store.on('error', function(error) {
    console.log("store >>>", error);
});

const storage = multer.diskStorage({
    destination: 'images',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.originalname + '-' + uniqueSuffix)
    }
  })

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }else {
        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: storage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(require('express-session')({
    secret: 'my secret',
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    // },
    store: store,
    resave: false,
    saveUninitialized: false
  }));

app.use(csrfProtection);
app.use(flash());

// added isAuthenticated and csrfToken params for every view
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// user attached to every request
app.use((req, res, next) => {
    // ** This code used Sequelize to retrive data
    // User.findByPk(1).then((user) => {
    //     req.user = user; // sequelize user object
    //     next();
    // }).catch((err) => {
    //     console.log("error get user >>>", err);
    // });

    // ** This code used mongodb to retrive data
    // User.findById('633d379f7dc8b88c24ce0d47').then(user => {
    //     req.user = new User(user.username, user.email, user.cart, user._id);
    //     next();
    // }).catch(err => {
    //     console.log("error get user >>>", err);
    // });


    // ** This code used mongoose to retrive data
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if(!user) {
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        console.log("error get user >>>", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// special middleware to identify errors return by next(new Error())
app.use((error, req, res, next) => {
    // res.redirect('/500');
    res.status(500).render('500', { 
        pageTitle: 'Something went wrong',
        path: '/500',
    });
});


// *** mongodb code base
// database.mongoConnect((client) => {
//     console.log("mongo client >>", client);
//     app.listen(3000);
// });

// *** use mongoose code base
mongoose.connect(MONGODB_URL)
.then(result => {
    app.listen(3000);
    console.log('connected to port 3000');
}).catch(err => {
    console.log(err);
});