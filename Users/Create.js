const database = require('../mongodb-connect');
const express = require('express');
const bodyParser= require('body-parser')
const cors = require('cors');
const app = express();
const port = 8011;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());


app.post('/user-create', (req,res,next)=>
{

    var roll_type= req.body.roll_type;
    getid(roll_type).then((result)=>
    {
     // console.log(result[0]._id);
      return insertToDatabase(result[0]._id,req);
    })
    .then((result)=>
    {
        res.send(result);
    })
    .catch((error)=>
    {
        res.send(error);
    })

})

var insertToDatabase=(id,req)=>
{

  return new Promise((resolve,reject)=>
  {
    var document =
    {
        id:id,
        username:req.body.username,
        password:req.body.password,
        roll_type:req.body.roll_type,
        email:req.body.email,
        status:"",
        login_attempts:0,
        login_timestamp:"",
        logout_timestamp:""
    };

    database.db.collection("Users").insertOne(document, (err, result) => 
    {
      if(err) 
      {
        reject('Could not add to database!');
      }
      resolve('Document added successfully!');
    });
  })
}

  var getid = (roll_type)=>
  {
      return new Promise((resolve,reject)=>
      {
        const databaseObject = database.db;
        databaseObject.collection('Role').find({Type:roll_type}).toArray
        ((err,result)=>
        {
          if(err)
            reject('Could not add to database!');
          resolve(result);
        })
      })

  }


app.listen(port, () => console.log(`Server listening on port ${port}!`))