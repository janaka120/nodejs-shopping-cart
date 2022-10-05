
// ** use Sequelize ORM instant of mysql2
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'root'
// });

// module.exports = pool.promise();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'root', {dialect: 'mysql', host: 'localhost'});

module.exports = sequelize