var http = require('http');
const database = require('./mongodb-connect');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4020;
app.use(cors());

app.get('/getById/:id', (req,res) =>
{
  const databaseObject = database.db;
  let mid = parseInt(req.params.id);
 
  databaseObject.collection('users').find({id:mid}).toArray((err,results)=>
  {
    if(err)
      res.send('Unable to find ID');

    res.send(results);
  })
}
)

app.get('/getAll', (req,res) =>
{
    const databaseObject = database.db;
    databaseObject.collection('users').find().toArray((err,results)=>
    {
        if(err)
          res.send('Error!');

        res.send(results);
    }
    );  
}
)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))




