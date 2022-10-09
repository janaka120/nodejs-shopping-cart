const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
// const database = require('./util/database'); // used by mongodb
const User = require('./models/user');
const app = express();

const MONGODB_URL = ''; // mongodb url

var store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
    console.log("store >>>", error);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({
    secret: 'my secret',
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    // },
    store: store,
    resave: false,
    saveUninitialized: false
  }));

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
        req.user = user;
        next();
    }).catch(err => {
        console.log("error get user >>>", err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


// *** mongodb code base
// database.mongoConnect((client) => {
//     console.log("mongo client >>", client);
//     app.listen(3000);
// });

// *** use mongoose code base
mongoose.connect(MONGODB_URL)
.then(result => {
    User.findOne().then(user => {
        if(!user) {
            const user = new User({
                name: 'admin',
                email: 'admin@test.com',
                cart: {
                    items: [],
                }
            });
            user.save();
            console.log("user created !")
        }
    }).catch(err => {
        console.log("create user err >>>", err);
    })
    app.listen(3000);
    console.log('connected to port 3000');
}).catch(err => {
    console.log(err);
});