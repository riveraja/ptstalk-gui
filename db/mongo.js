const { MongoClient } =  require('mongodb');
const util = require('util');

require('dotenv').config();

// const uri = process.env.MONGOURI;
var dbusercred = '';
if (process.env.DBUSER !== '') {
    dbusercred = util.format("%s@%s:", process.env.DBUSER, process.env.DBPASS);
}

const dbhost = process.env.DBHOST;
const dbport = process.env.DBPORT;
const authdb = process.env.AUTHDB;

const uri = util.format("mongodb://%s%s:%d/%s", dbusercred, dbhost, dbport, authdb)

const connection = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

connection.connect(function(error) {
    if (error) {
        console.log(error);
    };
});

module.exports = connection
