// ** This code use mysql2 to retrive data from DB
// const db = require('../util/database');

// const Cart = require('./cart');

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {
//     return db.execute(
//       'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
//       [this.title, this.price, this.imageUrl, this.description]
//     );
//   }

//   static deleteById(id) {}

//   static fetchAll() {
//     return db.execute('SELECT * FROM products');
//   }

//   static findById(id) {
//     return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
//   }
// };


// ** This code used Sequelize to retrive data
// const Sequelize =  require('sequelize');

// const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: true,
//     primaryKey: true
//   },
//   title: {
//     type: Sequelize.STRING,
//   },
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });


// ** This code used mongodb to retrive data
// const { ObjectId } = require('mongodb');


// const getDb = require('../util/database').getDb;
// class Product {
//   constructor(title, price, description, imageUrl, userId = null) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('products')
//     .insertOne(this)
//     .then(result => {
//       console.log(result);
//       return "product created!"
//     })
//     .catch(err => {
//       console.log("db insert err >>>", err);
//       return err;
//     })
//   }

//   update(prodId) {
//     const db = getDb();
//     return db.collection('products')
//     .updateOne(
//       {_id: ObjectId(prodId)},
//       {
//         $set: {
//           title: this.title,
//           price: this.price,
//           description: this.description,
//           imageUrl: this.imageUrl
//         }
//       },
//       { upsert: true }
//     )
//     .then(result => {
//       console.log(result);
//       return "product updated!"
//     })
//     .catch(err => {
//       console.log("db update err >>>", err);
//       return err;
//     })
//   }

//   static fetchAll() {
//     const db = getDb();
//     // `toArray()` method will return all the product collection. If there is lot of data, use pagination to retrive data  
//     return db.collection('products').find().toArray()
//     .then(products => {
//       return products;
//     }).catch(err => {
//       console.log('fetchAll err >>', err);
//       return err;
//     })
//   }

//   static fetchById(productId) {
//     const db = getDb();
//     return db.collection('products').find({"_id": {$eq : ObjectId(productId)}}).next()
//     .then(product => {
//       console.log("fetchProduct result >>>", product);
//       return product;
//     }).catch(err => {
//       console.log("fetch product err >>>", err);
//     })
//   }

//   static deleteById(productId) {
//     const db = getDb();
//     return db.collection('products').deleteOne({"_id": {$eq : ObjectId(productId)}})
//     .then(result => {
//       console.log("delete Product result >>>");
//       return product;
//     }).catch(err => {
//       console.log("delete product err >>>", err);
//     })
//   }

// }

// module.exports = Product;


// *** mongoose code base
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true 
  },
  description: {
    type: String,
    required: true 
  },
  price: {
    type: Number,
    required: true 
  },
  imageUrl: {
    type: String,
    required: true 
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

module.exports = mongoose.model('Product', productSchema);