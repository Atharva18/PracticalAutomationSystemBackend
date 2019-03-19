const database = require('./mongodb-connect');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require('multer');
const csv = require('csvtojson');
const upload = multer({ dest: './uploads' });
const app = express();
const port = 8023;

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads')
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  }
})

var fileName = '';
const upload = multer({ storage: storage })


function getResponseObject(result,data)
{
  var obj=
  {
    result:result,
    data:data

  }

  return obj;
}

//Provide preview of CSV file before inserting in DB
app.post('/csv-preview', upload.single('file'), (req, res, next) => 
{
  csv({
    noheader: false,
    output: "json"
  })
  .fromFile(req.file.path)
  .then((csvRow) => 
  {
    res.json(csvRow);
  })
  .catch((error) =>
  {
    res.send(error);
  })
})

//add entries from csv to database
app.post('/addfrom-csv', urlencodedParser, jsonParser, (req, res) => {
  var csvFilePath = __dirname + '/uploads/' + fileName;
  console.log(csvFilePath);
  csv()
    .fromFile(csvFilePath)
    .subscribe((json) => {
      return new Promise((resolve, reject) => {
        var roll_type = "user";
        return getid(roll_type)
          .then((result) => {
            var document =
            {
              id: result[0]._id,
              fname: json.fname,
              lname: json.lname,
              username: json.username,
              email: json.email,
              status: "",
              login_attempts: 0,
              login_timestamp: "",
              logout_timestamp: ""
            };
            database.db.collection("Users").insertOne(document, (err, result) => {
              if (err) {
                reject('Could not add to database!');
              }
              else {
                resolve('Document added successfully!');
              }
            });
          })
          .then((result) => {
            res.send(result);
          })
      })
    });
});


//Add/Update course
app.post('/course-create', urlencodedParser, jsonParser, (req, res) => {
  return insertCourse(req, res)
    .then((result) => {
      var obj = getResponseObject('Success', result);
      res.send(obj);
    })
    .catch((error) => {
      var obj = getResponseObject('Failure', error);
      res.send(obj);
    })
})

var insertCourse = (req, res) => {
  return new Promise((resolve, reject) => {
    var document =
    {
      course: req.body.course,
      branch: req.body.branch,
      year: req.body.year,
      sem: req.body.sem,
      code: req.body.code
    }
    database.db.collection('Course').findOneAndUpdate(document, { $set: { pattern: req.body.pattern } }, { upsert: true }, (err, result) => {
      if (err)
        reject("Failure");
      resolve("Success");
    })
  })
}

//Display Courses
app.get('/findAll-course', urlencodedParser, jsonParser, (req, res) =>
{
  const databaseObject = database.db;
  databaseObject.collection('Course').find().toArray((err, result) => {
    if (err)
      res.send("Error!");
    else if (result.length == 0)
      res.send("No course present!");
    res.send(result);
  });

})

//Add/Update new branch
app.post('/branch-create', urlencodedParser, jsonParser, (req, res)=>
{
  var bit = 0;
  database.db.collection('Branch').insertOne({ Type: req.body.Type }, { upsert: true }, (err, result) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
        var obj=getResponseObject('Success',req.body.Type);
    }
      res.send(obj);
  });
})

//Delete Branch
app.delete('/delete-branch/:Type', (req, res) => 
{
  const databaseObject = database.db;
  databaseObject.collection('Branch').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Branches
app.get('/findAll-branch', (req, res) =>
{
  const databaseObject = database.db;
  databaseObject.collection('Branch').find().toArray((err, results) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
    var obj = getResponseObject('Success',results);
    }

    res.send(obj);

  });
})


//Add/Update new Department
app.post('/department-create', urlencodedParser, jsonParser, (req, res)=>
{
  var bit = 0;
  database.db.collection('Department').insertOne({ Type: req.body.Type }, { upsert: true }, (err, result) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
        var obj=getResponseObject('Success',req.body.Type);
    }
      res.send(obj);
  });
})

//Delete Department
app.delete('/delete-department/:Type', (req, res) => 
{
  const databaseObject = database.db;
  databaseObject.collection('Department').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Departments
app.get('/findAll-department', (req, res) =>
{
  const databaseObject = database.db;
  databaseObject.collection('Department').find().toArray((err, results) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
    var obj = getResponseObject('Success',results);
    }

    res.send(obj);

  });
})

// Read all Roles
app.get('/findAll-role', (req, res) =>
{
  const databaseObject = database.db;
  databaseObject.collection('Role').find().toArray((err, results) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
    var obj = getResponseObject('Success',results);
    }

    res.send(obj);

  });
})

// Add/Update new role
app.post('/role-create', urlencodedParser, jsonParser, (req, res)=>
{
  var bit = 0;
  database.db.collection('Role').findOneAndUpdate({ Type: req.body.Type }, { $set:{ bit: 0 } }, { upsert: true }, (err, result) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
        var obj=getResponseObject('Success',req.body.Type);
    }
      res.send(obj);
  });
})

//Delete Role
app.delete('/delete/:Type', (req, res) => 
{
  const databaseObject = database.db;
  databaseObject.collection('Role').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Roles
app.get('/findAll-role', (req, res) =>
{
  const databaseObject = database.db;
  databaseObject.collection('Role').find().toArray((err, results) => {
    if (err)
    {
     var obj = getResponseObject('Failure',null);
    }
    else
    {
    var obj = getResponseObject('Success',results);
    }

    res.send(obj);

  });
})

// Insert to Database
app.post('/user-create', urlencodedParser, jsonParser, (req, res) => {

  var username = req.body.username;
  var roll_type = req.body.roll_type;
  var count = 0;
  database.db.collection('Users').find({ username: { $eq: username } }).count((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
      res.send(obj);
    }
    if (results > 0) {
      var obj = getResponseObject('User already exists', null);
      res.send(obj);
    }
    else {
      getid(roll_type).then((result) => {
        return insertToDatabase(result[0]._id, req);
      })
        .then((result) => {
          var obj = getResponseObject('Success', result);
          res.send(obj);
        })
        .catch((error) => {
          var obj = getResponseObject('Failure', null);
          res.send(obj);
        })
    }
  })
})

//Function 2 for Insert
var insertToDatabase = (id, req) => 
{
  return new Promise((resolve, reject) => {
    var document =
    {
      id: id,
      fname: req.body.fname,
      lname: req.body.lname,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      status: "",
      login_attempts: 0,
      login_timestamp: "",
      logout_timestamp: ""
    };
    database.db.collection("Users").insertOne(document, (err, result) => {
      if (err) {
        reject('Could not add to database!');
      }
      resolve(document);
    });
  })
}

//Function 1 for Insert
var getid = (roll_type) => 
{
  return new Promise((resolve, reject) => {
    const databaseObject = database.db;
    databaseObject.collection('Role').find({ Type: roll_type }).toArray
      ((err, result) => {
        if (err)
          reject('Could not add to database!');
        resolve(result);
      })
  })
}

// Read entries by type and username
app.get('/find-user/:type/:username', urlencodedParser, jsonParser, (req, res) => 
{
  const databaseObject = database.db;

  let mtype = req.params.type;
  let username = req.params.username;

  databaseObject.collection('Users').find({ roll_type: mtype }, { username: username }).toArray((err, results) => {
    if (err)
      res.send('Unable to find ID');
    else if (results.length == 0)
      res.send('ID not found');
    else
      res.send(results);
  })
})

//Returns roll_type if username and password are correct 
app.post('/findType', urlencodedParser, jsonParser, (req, res) => {
  const databaseObject = database.db;
  let username = req.body.username;
  let password = req.body.password;
  databaseObject.collection('Users').find({ username: { $eq: username }, password: { $eq: password } }, { projection: { _id: 0, id: 1 } }).toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
      res.send(obj);
    }
    else if (results.length == 0) {
      var obj = getResponseObject('Wrong username or password', null);
      res.send(obj);
    }
    else {
      return getrole(results[0].id)
      .then((result) =>
      {
        var obj = getResponseObject('Success', result);
        res.send(obj);
      })
      .catch((error) =>
      {
        var obj = getResponseObject('Failure', error);
        res.send(obj);
      })
      //var obj = getResponseObject('Success', results);
    }
  })
})

var getrole = (id) =>{
  return new Promise((resolve, reject) =>
  {
    const databaseObject = database.db;
    databaseObject.collection('Role').find({ _id: id }, { projection: { _id: 0, Type: 1 } }).toArray((err, result) =>
    {
      if(err)
        reject("Failed to obtain ID");
      resolve(result);
    })
  })
}


// Read all entries
app.get('/findAll', urlencodedParser, jsonParser, (req, res) => 
{
  const databaseObject = database.db;
  databaseObject.collection('Users').find().toArray((err, results) => {
    if (err)
      res.send('Error!');
    res.send(results);
  }
  );
})

//Update Database
app.put('/update', urlencodedParser, jsonParser, (req, res) => 
{

  // console.log(req);
  var user = req.body.username;

  const databaseObject = database.db;
  databaseObject.collection('Users').updateOne({ username: user }, { $set: req.body }, (err, result) => {

    if (err)
      res.send('Could not update!');
    res.send('User Updated Successfully');
  })

})

//Delete User
app.delete('/delete/:username', (req, res) => 
{

  //console.log('In delete');
  //console.log(req.params.username);
  const databaseObject = database.db;
  databaseObject.collection('Users').deleteOne({ username: req.params.username }, (err, result) => {
    if (err)
      res.send('Could not Delete!');

    res.send('User deleted successfully!');
  })

})

// Add program
app.post('/program-create', urlencodedParser, jsonParser, (req, res) => 
{
  const branch = req.body.branch
  const Year = req.body.program
  database.db.collection('Programme').findOneAndUpdate({ branch: branch }, { $push: {program: {Year}} }, { upsert: true, returnOriginal: false }, (err, result) => {
    if (err)
    {
      var obj = getResponseObject('Failure', error)
    }
    else
    { 
      var obj = getResponseObject('Success', result.value)
    }
    res.send(obj);
  });
})

// Display all the programs
app.get('/findAll-program', urlencodedParser, jsonParser, (req, res) => 
{
  const databaseObject = database.db;
  databaseObject.collection('Programme').find().toArray((err, result) => {
    if (err)
      res.send("Error!");
    else if (result.length == 0)
      res.send("No program present!");
    res.send(result);
  });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`))