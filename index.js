const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

const utils = require('./common/utils');

const app = express();
const PORT = process.env.port||8888;
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true,
}));

//Information
app.post('/api/export', (req, res)=>{
  utils.objectToExcelFile(req.body)
  .then(fileName=>{
    console.log('done2');
    res.json(fileName);
  })
  .catch(err=>{
    console.error(err);
    res.json({err});
  });
});

app.use('/', express.static(path.join(__dirname,'static')));

app.listen(PORT);
console.log(`listening on:  http://localhost:${PORT}/`);
