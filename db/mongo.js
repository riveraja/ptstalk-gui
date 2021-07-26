const { MongoClient } =  require('mongodb');

require('dotenv').config();

const uri = process.env.MONGOURI;

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
