const database = require('./mongodb-connect');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require('multer');
const csv = require('csvtojson');
const app = express();
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const port = 8023;
var usbDetect = require('usb-detection');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });
//const BrowserHistory = require('node-browser-history');
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
var isCSV = '';
const upload = multer({
  storage: storage
})

usbDetect.startMonitoring();

usbDetect.on('add', function (device) {
  console.log(device);
});

function getResponseObject(result, data) {
  var obj =
  {
    result: result,
    data: data
  }

  return obj;
}

//detect USB
/*app.post('/run', urlencodedParser, jsonParser, (req, res) => {
  const subprocess = runScript()
  console.log('Script running')
  res.set('Content-Type', 'text/plain');
  subprocess.stdout.pipe(res)
  subprocess.stderr.pipe(res)  
})

//function 1 to detect USB
function runScript() {
  return spawn('python', [
    "-u",
    path.join(__dirname, 'detect_usb.py')
  ]);
}
const subprocess = runScript()
subprocess.stdout.on('data', (data) => {
  console.log(`data:${data}`);
});
subprocess.stderr.on('data', (data) => {
  console.log(`error:${data}`);
});
subprocess.stderr.on('close', () => {
  console.log("Closed");
});
*/

//Provide preview of CSV file before inserting in DB
app.post('/csv-preview', upload.single('file'), (req, res) => {
  fileName = req.file.originalname;
  csv({
    noheader: false,
    output: "json"
  })
    .fromFile(req.file.path)
    .then((csvRow) => {
      res.json(csvRow);
    })
    .catch((error) => {
      res.send(error);
    })
})

//add entries from csv to database
app.post('/addfrom-csv', urlencodedParser, jsonParser, (req, res) => {
  var csvFilePath = __dirname + '/uploads/' + fileName;
  csv()
    .fromFile(csvFilePath)
    .then((json) => {
      database.db.collection('Role').find({ Type: json[0].roll_type }).toArray((err, result) => {
        if (err) {
          var obj = getResponseObject('Failure', null);
          res.send(obj);
        }
        else {
          for (var i = 0; i < json.length; i++) {
            delete json[i].roll_type,
              json[i].id = result[0]._id,
              json[i].status = "",
              json[i].login_attempts = 0,
              json[i].login_timestamp = "",
              json[i].logout_timestamp = ""
          }
          database.db.collection('Users').insertMany(json, (err, result) => {
            if (err) {
              var obj = getResponseObject('Failure', null);
            }
            else {
              var obj = getResponseObject('Success', null);
            }
            res.send(obj);
          })
        }
      })
    })
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
app.get('/findAll-course', urlencodedParser, jsonParser, (req, res) => {
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
app.post('/branch-create', urlencodedParser, jsonParser, (req, res) => {
  var bit = 0;
  database.db.collection('Branch').insertOne({ Type: req.body.Type }, { upsert: true }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', req.body.Type);
    }
    res.send(obj);
  });
})

//Delete Branch
app.delete('/delete-branch/:Type', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Branch').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Branches
app.get('/findAll-branch', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Branch').find().toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', results);
    }

    res.send(obj);

  });
})


//Add/Update new Department
app.post('/department-create', urlencodedParser, jsonParser, (req, res) => {
  var bit = 0;
  database.db.collection('Department').insertOne({ Type: req.body.Type }, { upsert: true }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', req.body.Type);
    }
    res.send(obj);
  });
})

//Delete Department
app.delete('/delete-department/:Type', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Department').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Departments
app.get('/findAll-department', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Department').find().toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', results);
    }

    res.send(obj);

  });
})

// Read all Roles
app.get('/findAll-role', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Role').find().toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', results);
    }
    res.send(obj);
  });
})

// Add/Update new role
app.post('/role-create', urlencodedParser, jsonParser, (req, res) => {
  var bit = 0;
  database.db.collection('Role').findOneAndUpdate({ Type: req.body.Type }, { $set: { bit: 0 } }, { upsert: true }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', req.body.Type);
    }
    res.send(obj);
  });
})

//Delete Role
app.delete('/delete/:Type', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Role').deleteOne({ Type: req.params.Type }, (err, result) => {
    if (err)
      res.send('Failure');
    res.send('Success');
  })
})

// Read all Roles
app.get('/findAll-role', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Role').find().toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', results);
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
var insertToDatabase = (id, req) => {
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
var getid = (roll_type) => {
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
app.get('/find-user/:type/:username', urlencodedParser, jsonParser, (req, res) => {
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

//Returns students of a particular branch and year
app.get('/find-users/:branch/:year', urlencodedParser, jsonParser, (req, res) => {
  let id;
  var branch = req.params.branch;
  var year = req.params.year;
  database.db.collection('Role').findOne({ Type: 'user' }, (err, results) => {
    if (err) {
      const obj = getResponseObject('Failure', null);
      res.send(obj);
    }
    else if (results.length == 0) {
      const obj = getResponseObject('Role does not exist', null);
      res.send(obj);
    }
    else {
      id = results["_id"];
      database.db.collection('Users').find({ id: { $eq: id }, branch: { $eq: branch }, year: { $eq: year } }, { projection: { _id: 1, fname: 1, lname: 1, email: 1, branch: 1, year: 1 } }).toArray((err, result) => {
        if (err) {
          const obj = getResponseObject('Failure', null);
          res.send(obj);
        }
        else if (result.length == 0) {
          const obj = getResponseObject('Users not found.', null);
          res.send(obj);
        }
        else {
          res.send(result);
        }
      })
    }
  })
})


//Returns roll_type if username and password are correct 
app.post('/findType', urlencodedParser, jsonParser, (req, res) => {
  const databaseObject = database.db;
  let username = req.body.username;
  let password = req.body.password;
  var now = new Date();
  databaseObject.collection('Users').find({ username: { $eq: username }, password: { $eq: password } }, { projection: { _id: 1, id: 1 } }).toArray((err, results) => {
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
        .then((result) => {
          database.db.collection('Users').findOneAndUpdate({ username: { $eq: username }, password: { $eq: password } }, { $set: { login_timestamp: now.toUTCString() } }, (err, result) => {
            if (err) {
              console.log('Failure');
            }
          })
          result[0].id = results[0]._id;
          var obj = getResponseObject('Success', result);
          res.send(obj);
        })
        .catch((error) => {
          var obj = getResponseObject('Failure', error);
          res.send(obj);
        })
      //var obj = getResponseObject('Success', results);
    }
  })
})

var getrole = (id) => {
  return new Promise((resolve, reject) => {
    const databaseObject = database.db;
    databaseObject.collection('Role').find({ _id: id }, { projection: { _id: 0, Type: 1 } }).toArray((err, result) => {
      if (err)
        reject("Failed to obtain ID");
      resolve(result);
    })
  })
}


// Read all entries
app.get('/findAll', urlencodedParser, jsonParser, (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Users').find().toArray((err, results) => {
    if (err)
      res.send('Error!');
    res.send(results);
  }
  );
})

//Update Database
app.put('/update', urlencodedParser, jsonParser, (req, res) => {

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
app.delete('/delete/:username', (req, res) => {

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
app.post('/program-create', urlencodedParser, jsonParser, (req, res) => {
  const branch = req.body.branch
  const Year = req.body.program
  database.db.collection('Programme').findOneAndUpdate({ branch: branch }, { $push: { program: { Year } } }, { upsert: true, returnOriginal: false }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', error)
    }
    else {
      var obj = getResponseObject('Success', result.value)
    }
    res.send(obj);
  });
})

// Display all the programs
app.get('/findAll-program', urlencodedParser, jsonParser, (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Programme').find().toArray((err, result) => {
    if (err)
      res.send("Error!");
    else if (result.length == 0)
      res.send("No program present!");
    res.send(result);
  });
});

app.post('/findSubject', urlencodedParser, jsonParser, (req, res) => {
  const databaseObject = database.db;
  let branch = req.body.branch;
  let year = req.body.year;
  let sem = req.body.sem;
  databaseObject.collection('Course').find({ branch: { $eq: branch }, year: { $eq: year }, sem: { $eq: sem } }, { projection: { _id: 0, course: 1 } }).toArray((err, results) => {

    if (err) {
      var obj = getResponseObject('Failure', null);
      res.send(obj);
    }
    else if (results.length == 0) {
      var obj = getResponseObject('Wrong data provided', null);
      res.send(obj);
    }
    else {
      var obj = getResponseObject('Success', results);
      res.send(obj);
    }
    //var obj = getResponseObject('Success', results);

  })
})

//add a new exam
app.post('/exam-create', urlencodedParser, jsonParser, (req, res) => {
  return getunicode(req.body.course)
    .then((result) => {
      return insertToExamTable(result[0].code, req)
    })
    .then((result) => {
      var obj = getResponseObject("Exam created successfully!", result)
      res.send(obj)
    })
    .catch((err) => {
      var obj = getResponseObject("Failed to create exam", null)
      res.send(obj)
    })
})

//function1 to add a new exam
var getunicode = (course) => {
  return new Promise((resolve, reject) => {
    database.db.collection('Course').find({ course: course }).toArray((err, result) => {
      if (err) {
        reject("Failed to obtain University Subject code.")
      }
      resolve(result)
    })
  })
}

//function2 to add a new exam
var insertToExamTable = (code, req) => {
  return new Promise((resolve, reject) => {
    var date = req.body.date;
    var start_date = date[0];
    var end_date = date[1];
    database.db.collection('Exam').findOneAndUpdate({ _id: code }, { $set: { course: req.body.course, exam_name: req.body.exam_name, start_date: start_date, end_date: end_date, status: "Not completed" } }, { upsert: true }, (err, result) => {
      if (err) {
        reject("Error");
      }
      else {
        resolve("Success");
      }
    })
  })
}

//Add bulk entries
app.post('/user-enrol', urlencodedParser, jsonParser, (req, res) => {
  var course = req.body.subject;

  getunicode(course).then((result) => {
    return insertManyToDB(result[0].code, req)
  })
    .then((result) => {
      const obj = getResponseObject("Success", result);
      res.send(obj)
    })
    .catch((error) => {
      var obj = getResponseObject('Failure', null);
      res.send(obj);
    })
})


//function 1 to add bulk entries 
var insertManyToDB = (id, req) => {
  var data = req.body;
  data['examid'] = id;
  return new Promise((resolve, reject) => {
    database.db.collection('Exam-student').find({ examid: id }).toArray((err, result) => {
      if (result.length == 1) {
        database.db.collection('Exam-student').updateOne({ examid: id }, { $addToSet: { user: { $each: req.body.user } } }, { upsert: true }, (err, result) => {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
        })
      }
      else if (result.length == 0) {
        database.db.collection('Exam-student').insertOne(data, (err, result) => {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
        })
      }
    })
  })
}


//Add Problem Statement
app.post('/problem-statement-create', urlencodedParser, jsonParser, (req, res) => {
  return getunicode(req.body.course)
    .then((result) => {
      return insertToExamTopic(result[0].code, req)
    })
    .then((result) => {
      var obj = getResponseObject("Problem statement added successfully", result)
      res.send(obj)
    })
    .catch((err) => {
      var obj = getResponseObject("Failed to add statements", null)
      res.send(obj)
    })
})

var insertToExamTopic = (code, req) => {
  return new Promise((resolve, reject) => {
    database.db.collection('Exam-Topic').findOneAndUpdate({ statement: req.body.statement }, { $set: { exam_id: code, course: req.body.course } }, { upsert: true }, (err, result) => {
      if (err) {
        reject("Error");
      }
      else {
        resolve("Success");
      }
    })
  })

}

//Display Available exam
app.get('/findAll-exam', (req, res) => {
  const databaseObject = database.db;
  databaseObject.collection('Exam').find().toArray((err, results) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else {
      var obj = getResponseObject('Success', results);
    }

    res.send(obj);

  });
})

//find students enrolled for a particular subject
app.get('/find-examinees/:branch/:year/:subject', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Exam-student').find({ branch: { $eq: req.params.branch }, year: { $eq: req.params.year }, subject: { $eq: req.params.subject } }, { projection: { _id: 0, user: 1 } }).toArray((err, result) => {
    if (err) {
      var obj = getResponseObject("Failed to obtain enrolled students", null);
      res.send(obj);
    }
    else if (result.length == 0) {
      var obj = getResponseObject("Failure", null);
      res.send(obj);
    }
    else {
      res.send(result);
    }
  })
})

//find appeared subjects of a student
app.post('/appeared-subjects', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Exam-student').find({ 'user': { $elemMatch: { 'id': req.body.id } } }, { projection: { '_id': 0, 'subject': 1, 'name': 1 } }).toArray((err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result.length == 0) {
      var obj = getResponseObject('Student not enrolled.', null);
    }
    else {
      var obj = getResponseObject('Success', result);
    }
    res.send(obj);
  })
})

//returns start date and end date of a particular subject's exam
app.post('/get-dates', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Exam').findOne({ course: req.body.course }, { projection: { _id: 0, start_date: 1, end_date: 1 } }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result == null) {
      var obj = getResponseObject('Exam not created.', null);
    }
    else {
      var obj = getResponseObject('Success', result);
    }
    res.send(obj);
  })
})

//display statements of a particular subject
app.post('/find-stmt', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Exam-Topic').find({ course: req.body.course }, { projection: { _id: 0, statement: 1 } }).toArray((err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result.length == 0) {
      var obj = getResponseObject('No problem statements added.', null);
    }
    else {
      var obj = getResponseObject('Success', result);
    }
    res.send(obj);
  })
})

//store details about student and allocated problem statement
app.post('/add-student-topic', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Student-Topic').findOne({ id: req.body.id }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
      res.send(obj);
    }
    else if (result == null) {
      database.db.collection('Student-Topic').findOneAndUpdate({ id: req.body.id }, { $push: { questions: { course: req.body.course, statement: req.body.statement, changes: req.body.changes, uploads: '' } } }, { upsert: true }, (err, result) => {
        if (err) {
          var obj = getResponseObject('Failure', null);
        }
        else {
          var obj = getResponseObject('Success', result);
        }
        res.send(obj)
      })
    }
    else if (result) {
      for (var detail = 0; detail < result['questions'].length; detail++) {
        if (result['questions'][detail].course == req.body.course) {
          //index = detail;
          result['questions'][detail].changes = req.body.changes;
          result['questions'][detail].statement = req.body.statement;
          break;
        }
      }
      database.db.collection('Student-Topic').updateOne({ id: req.body.id }, { $set: result }, { upsert: true }, (err, results) => {
        if (err) {
          var obj = getResponseObject('Failure', null);
        }
        else {
          var obj = getResponseObject('Success', results);
        }
        res.send(obj);
      })
    }
  })
})

//retrieve statement allocated to a student along with upload status
app.post('/find-student-topic', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Student-Topic').findOne({ 'id': req.body.id }, { projection: { '_id': 0, 'id': 0 } }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result == null) {
      var obj = getResponseObject('No statement allocated.', null);
    }
    else {
      var course = req.body.course;
      for (var entry = 0; entry < result['questions'].length; entry++) {
        if (result['questions'][entry].course == course) {
          result['statement'] = result['questions'][entry].statement;
          result['changes'] = result['questions'][entry].changes;
          result['uploads']=result['questions'][entry].uploads;
          break;
        }
      }
      delete result['questions'];
      var obj = getResponseObject('Success', result);
    }
    res.send(obj);
  })
})

//find the number of changes requested by a student
app.post('/find-student-changes', urlencodedParser, jsonParser, (req, res) => {
  database.db.collection('Student-Topic').findOne({ id: req.body.id }, { projection: { _id: 0, id: 0 } }, (err, result) => {
    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result == null) {
      var obj = getResponseObject('No problem statement allocated.', null);
    }
    else {
      var course = req.body.course;
      for (var entry = 0; entry < result['questions'].length; entry++) {
        if (result['questions'][entry].course == course) {
          result['changes'] = result['questions'][entry].changes;
          break;
        }
      }
      delete result['questions'];
      var obj = getResponseObject('Success', result);
      res.send(obj);
    }
  })
})

//student upload code
let code = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      let batch = req.headers.batchname
      console.log(batch)
      //console.log(req.body.batchname);
      let dir = `./codes/${batch}`
      fs.mkdirsSync(dir);
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    }
  })
})

app.post('/upload-code', code.array('files[]'), (req, res) => {
  var obj = getResponseObject('Success', null);
  res.send(obj);
})

// function 1 to find batch
var getexamid = (exam_name) => {
  return new Promise((resolve, reject) => {
    database.db.collection('Exam').find({ exam_name: exam_name }).toArray((err, result) => {
      if (err) {
        reject("Failed to obtain University Subject code.")
      }
      resolve(result)
    })
  })
}

// find the batches 
app.post('/find-batch', urlencodedParser, jsonParser, (req, res) => {
  var exam_name = req.body.exam_name;
  getexamid(exam_name).then((result) => {
    database.db.collection('Exam-student').find({ examid: result[0]._id }, { projection: { _id: 0, name: 1 ,subject: 1} }).toArray((err, result) => {
      if (err) {
        var obj = getResponseObject('Failure', null);
      }
      else if (result.length == 0) {
        var obj = getResponseObject('batches not found', null);
      }
      else {
        var obj = getResponseObject('Success', result);
      }
      res.send(obj);
    })
  })
})

 //Find all students under batches
 app.post('/find-batch_students', urlencodedParser, jsonParser, (req, res) => {
  var batch_name = req.body.batch_name;
  var subject = req.body.subject;
  database.db.collection('Exam-student').find({ subject: { $eq: subject }, name: { $eq: batch_name } }, { projection: { _id: 0, user: 1 } }).toArray((err, result) => {

    if (err) {
      var obj = getResponseObject('Failure', null);
    }
    else if (result.length == 0) {
      var obj = getResponseObject('empty batch found', null);
    }
    else {
      var obj = getResponseObject('Success', result);
    }
    res.send(obj);
  })
})

app.listen(port, () => console.log(`Server listening on port ${port}!`))

