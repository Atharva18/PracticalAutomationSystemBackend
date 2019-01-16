const database = require('../mongodb-connect');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4020;
app.use(cors());

app.get('/find-user/:type/:username', (req,res) =>
{
  const databaseObject = database.db;

  let mtype= req.params.type;
  let username= req.params.username;
 
  databaseObject.collection('Users').find({roll_type:mtype},{username:username}).toArray((err,results)=>
  {
    if(err)
      res.send('Unable to find ID');

      if(results.length==0)
        res.send('ID not found');

    res.send(results);
  })
}
)

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
}
)
app.listen(port, () => console.log(`Server listening on port ${port}!`))




