// ** This code used Sequelize to retrive data
// const Sequelize = require('Sequelize');


// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//     allowNull: true,
//     primaryKey: true
//     },
//     name: Sequelize.STRING,
//     email: Sequelize.STRING
// });


// *** mongodb code base
// const { ObjectId } = require('mongodb');
// const getDb = require('../util/database').getDb;
// class User {
//     constructor(username, email, cart = [], id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//         .then(result => {
//             console.log("user save result >>>", result);
//             return 'user create successfully'
//         })
//         .catch(err => {
//             console.log("user save err >>>", err);
//             return err;
//         });
//     }

//     addToCart(product) {
//         const db = getDb();
//         const updatedCartItems = [...this.cart.items];
//         const indexOfExistProduct = this.cart.items.findIndex(item => item.productId.toString() == product._id.toString());
//         let newQuntity = 1;
//         if(indexOfExistProduct >= 0) {
//             newQuntity = this.cart.items[indexOfExistProduct].quantity + 1;
//             updatedCartItems[indexOfExistProduct].quantity = newQuntity;
//         }else {
//             updatedCartItems.push({
//                 productId: new ObjectId(product._id),
//                 quantity: newQuntity
//             });
//         }
//         const updatedCart = {items: updatedCartItems};
//         return db.collection('users').updateOne({_id: this._id}, {$set: {
//             cart: updatedCart
//         }})
//     }

//     getCart() {
//         const db = getDb();
//         console.log("this.cart >>>", this.cart);
//         const productIds = this.cart.items.map(item => item.productId);
//         return db.collection('products').find({_id: {$in: productIds}}).toArray()
//         .then(products => {
//             return products.map(product => {
//                 return {...product, quantity: this.cart.items.find(i => {
//                     return i.productId.toString() == product._id.toString();
//                 }).quantity
//             }
//             })
//         })
//         .catch(err => {
//             console.log("get cart err", err);
//             return err;
//         })
//     }

//     deleteItemFromCart(productId) {
//         const db = getDb();
//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
//         return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: updatedCartItems}}})
//         .then(result => {
//             return 'delete cart item successfully '
//         }).catch(err => {
//             console.log("deleteCartItem err >>>", err);
//             return err;
//         })
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: this._id,
//                     name: this.username,
//                 }
//             };
//             return db.collection('orders').insertOne(order)
//         }).then(result => {
//             this.cart = [];
//             return db.collection('users')
//             .updateOne({_id: ObjectId(this._id)}, {$set: {cart: {items: []}}})
//         }).then(result => {
//             console.log("clear user cart successfully");
//             return 'add order successfully';
//         }).catch(err => {
//             console.log("add Order err >>>", err);
//         })
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': ObjectId(this._id)}).toArray()
//         .then(orders => {
//             return orders;
//         })
//         .catch(err => {
//             console.log("get order err >>", err);
//         })
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').find({'_id': ObjectId(userId)}).next()
//         .then(user => {
//             return user;
//         })
//         .catch(err => {
//             console.log('user find by id err', err);
//             return err;
//         })
//     }
// }

// module.exports = User;


// mongooose schema

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    // name: {
    //     type: String,
    //     required: true,
    // },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
                quantity: {type: Number, required: true}
            },
        ],
    }
});

// register custome method in mongoose 
userSchema.methods.addToCart = function(product) {
    const indexOfExistProduct = this.cart.items.findIndex(item => item.productId.toString() == product._id.toString());
        let newQuntity = 1;
        const updatedCartItems = [...this.cart.items];
        if(indexOfExistProduct >= 0) {
            newQuntity = this.cart.items[indexOfExistProduct].quantity + 1;
            updatedCartItems[indexOfExistProduct].quantity = newQuntity;
        }else {
            updatedCartItems.push({
                productId: product._id,
                quantity: newQuntity
            });
        }
        const updatedCart = {items: updatedCartItems};
        this.cart = updatedCart;
        return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);