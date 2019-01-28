const database = require('./mongodb-connect');
const express = require('express');
const bodyParser= require('body-parser')
const cors = require('cors');
const multer = require('multer');
const csv = require('csvtojson');
//change the path as per your choice
const upload = multer({ dest: '/home/jay/uploads' });
const app = express();
const port = 8026;

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(cors());

app.post('/user-create-multiple', upload.single('file'), function(err, req, res, next)
{
    if(err)
    {
      console.log("Failed to upload file...");
    }
}, function(req, res, next){
  csv()
  .fromFile(req.file.path)
  .subscribe((json)=>
  {
    return new Promise((resolve, reject)=>
    {
      var roll_type = json.roll_type;
      getid(roll_type).then((result)=>
      {
        var document =
        {
          id:result[0]._id,
          fname:json.fname,
          lname:json.lname,
          username:json.username,
          password:json.password,
          roll_type:json.roll_type,
          email:json.email,
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
      .then((result)=>
      {
        res.send(result);
      })
      .catch((error)=>
      {
        res.send(error);
      })
    })
  })
});

// Insert to Database
app.post('/user-create', urlencodedParser, jsonParser, (req,res)=>
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
//Function 2 for Insert
var insertToDatabase=(id,req)=>
{
  return new Promise((resolve,reject)=>
  {
    var document =
    {
        id:id,
        fname:req.body.fname,
        lname:req.body.lname,
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

//Function 1 for Insert
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

// Read entries by type and username
  app.get('/find-user/:type/:username', (req,res) =>
  {
    const databaseObject = database.db;
  
    let mtype= req.params.type;
    let username= req.params.username;
   
    databaseObject.collection('Users').find({roll_type:mtype},{username:username}).toArray((err,results)=>
    {
      if(err)
        res.send('Unable to find ID');
      else if(results.length==0)
        res.send('ID not found');
      else
        res.send(results);
    })
  }
  )
  
// Read all entries
  app.get('/findAll', (req,res) =>
  {
      const databaseObject = database.db;
      databaseObject.collection('Users').find().toArray((err,results)=>
      {
          if(err)
            res.send('Error!');
          res.send(results);
      }
      );  
  })

//Update Database
  app.put('/update', urlencodedParser, jsonParser, (req,res)=>
  {

    // console.log(req);
    var user=req.body.username;

    const databaseObject= database.db;
    databaseObject.collection('Users').updateOne({username:user},{$set:req.body},(err,result)=>
    {

      if(err)
        res.send('Could not update!');
      res.send('User Updated Successfully');
    })

  })

  //Delete User
  app.delete('/delete/:username',(req,res)=>
  {

    //console.log('In delete');
    //console.log(req.params.username);
    const databaseObject= database.db;
    databaseObject.collection('Users').deleteOne({username:req.params.username},(err,result)=>
    {
        if(err)
          res.send('Could not Delete!');

        res.send('User deleted successfully!');
    })

  })

  app.post('/program-create', urlencodedParser, jsonParser, (req, res)=>
  {
    return insertProgram(req, res)
    .then((result)=>
    {
        res.send(result);
    })
    .catch((error)=>
    {
        res.send(error);
    })
  })

  var insertProgram = (req, res)=>
  {
    return new Promise((resolve,reject)=>
    {
      database.db.collection('Programme').findOneAndUpdate({branch: req.body.branch}, {$push: {program: req.body.program}}, {upsert: true}, (err, result)=>
      {
        if(err)
          reject("Failed to create program!");
        resolve("Programme created successfully!");
      });
    })
  }

  app.get('/program-show', urlencodedParser, jsonParser, (req, res)=>
  {
    const databaseObject = database.db;
    databaseObject.collection('Programme').find().toArray((err, result)=>
    {
      if(err)
        res.send("Error!");
      else if(result.length == 0)
        res.send("No program present!");
      res.send(result);
    });
  });

app.listen(port, () => console.log(`Server listening on port ${port}!`))