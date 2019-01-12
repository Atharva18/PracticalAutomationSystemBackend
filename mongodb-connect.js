const {MongoClient} = require('mongodb');

const constants= require('./constants')

const url = constants.URL +''+ constants.dbname;

//var obj = new ObjectID();

//console.log(obj);


MongoClient.connect(url,(err,client) =>
{
    if(err)
      return console.log('Unable to connect to MongoDB Server');
    
    console.log('Connected to MongoDB Server');

    const db = client.db(constants.dbname);

    module.exports.db=db;

}

);

