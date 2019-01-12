const {MongoClient} = require('mongodb');

const constants= require('./constants')

const url = constants.URL +''+ constants.DBNAME;

MongoClient.connect(url,(err,client) =>
{
    if(err)
      return console.log('Unable to connect to MongoDB Server');
    
    console.log('Connected to MongoDB Server');

    const db = client.db(constants.DBNAME);

    module.exports.db=db;

}

);

