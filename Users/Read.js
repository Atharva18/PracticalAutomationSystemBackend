const database = require('../mongodb-connect');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4021;
app.use(cors());

app.get('/findById/:id', (req,res) =>
{
  const databaseObject = database.db;
  let mid = parseInt(req.params.id);
 
  databaseObject.collection('Users').find({id:mid}).toArray((err,results)=>
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
app.listen(port, () => console.log(`Example app listening on port ${port}!`))




