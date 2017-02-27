const express = require('express');
//const firebaseConfig = require('./firebaseConfig.js');
const bodyParser = require('body-parser');
//const stream = require('stream');

const requestHandler = require('./requestHandler');
const requestHandlerAPI = require('./handlers/api');
const requestHandlerSETUP = require('./handlers/setup');

const app = express();
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.json());


////////////////////////////////////////////////
//////// DEFAULT ROUTES ////////////////////////
//////////////////////////////////////////////

app.get('/', (req, res) => {
  requestHandler.landing(req, res);
});

////////////////////////////////////////////////
//////// AUTH ROUTES ////////////////////////
//////////////////////////////////////////////

app.post('/login', (req, res) => {
  requestHandler.login(req, res);
});

app.post('/logout', (req, res) => {
  requestHandler.logout(req, res);
});

app.post('/createUser', (req, res) => {
  requestHandler.createUser(req, res);
}); 

app.post('/deleteUser', (req, res) => {
  requestHandler.deleteUser(req, res);
});

app.get('/checkUserCredentials', (req, res) => {
  requestHandler.checkUserCredentials(req, res);
});

////////////////////////////////////////////////
//////// IMAGE ROUTES ////////////////////////
//////////////////////////////////////////////

app.get('/vision', (req, res) => {
  requestHandler.gVision(req, res);
});

app.post('/postImage', (req, res) => {
  requestHandler.postImage(req, res);
});

app.post('/compareImage', (req, res) => {
  requestHandler.compareImage(req, res);
});

////////////////////////////////////////////////
//////// DATA ROUTES ////////////////////////
//////////////////////////////////////////////

app.get('/api/lists', (req, res) => {
  requestHandlerAPI.lists(req, res);
});

app.post('/api/lists', (req, res) => {
  requestHandlerAPI.listsCreate(req, res);
});

app.delete('/api/lists/:list_id', (req, res) => {
  requestHandlerAPI.listsDelete(req, res);
});

app.get('/api/items', (req, res) => {
  requestHandlerAPI.items(req, res);
});

app.post('/api/items', (req, res) => {
  requestHandlerAPI.itemsCreate(req, res);
});

app.post('/api/items/found', (req, res) => {
  requestHandlerAPI.itemsFound(req, res);
});

app.delete('/api/items/:item_id/:list_id', (req, res) => {
  requestHandlerAPI.itemsDelete(req, res);
});

app.get('/api/all', (req, res) => {
  requestHandlerAPI.all(req, res);
});

app.get('/api/create', (req, res) => {
  requestHandlerSETUP.create(req, res);
});

app.get('/api/delete', (req, res) => {
  requestHandlerSETUP.delete(req, res);
});

app.get('/api/*', (req, res) => {
  requestHandlerAPI.default(req, res);
});

////////////////////////////////////////////////
//////// CONFIG & LISTEN! ////////////////////////
//////////////////////////////////////////////

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

