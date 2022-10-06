const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
// const database = require('./util/database'); // used by mongodb
const User = require('./models/user');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


// mongodb code base
// database.mongoConnect((client) => {
//     console.log("mongo client >>", client);
//     app.listen(3000);
// });

// use mongoose code base
mongoose.connect("mongodb+srv://root:root@cluster0.lb4tnl8.mongodb.net/shop?retryWrites=true&w=majority")
.then(result => {
    app.listen(3000)
    console.log('connected to port 3000');
}).catch(err => {
    console.log(err);
});