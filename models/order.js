// ** sequelize code base
// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const OrderItem = sequelize.define('order', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   quantity: Sequelize.INTEGER
// })

// module.exports = OrderItem;


const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
        product: {type: Object, ref: 'Product', required: true},
        quantity: {type: Number, required: true}
    },
  ],
  user: {
      userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
      name: {type: String, required: true},
  }
});

module.exports = mongoose.model('Order', orderSchema);