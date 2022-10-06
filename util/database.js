
// ** use Sequelize ORM instant of mysql2
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'root'
// });

// module.exports = pool.promise();


// ** use Sequelize ORM db config
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'root', {dialect: 'mysql', host: 'localhost'});

// module.exports = sequelize


// ** use mongodb db config

const mongodb = require('mongodb');
const mongoClint = mongodb.MongoClient;

let _db;
const uri = "mongodb+srv://root:root@cluster0.lb4tnl8.mongodb.net/shop?retryWrites=true&w=majority";

const mongoConnect = (callback) => {
    mongoClint.connect(uri)
    .then(client => {
        console.log("successfully connected to mongodb");
        _db = client.db();
        callback(client);
    }).catch(err => {
        console.log("mongo db connect err >>>", err);
        throw err;
    });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    console('no database found!')
    throw 'no database found!';
}

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;

module.exports = {
    mongoConnect: mongoConnect,
    getDb: getDb
}