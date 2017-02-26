const headers = require('../headers');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'thesis',
    charset: 'utf8'
  }
});

const bookshelf = require('bookshelf')(knex);

// Our Models
const List = bookshelf.Model.extend({
  tableName: 'lists',
  hasTimestamps: true,
  items: function () {
    return this.hasMany(Item);
  }
});

const Item = bookshelf.Model.extend({
  tableName: 'items',
  hasTimestamps: true,
  list: function () {
      return this.belongsTo(List);
    }
});

const sendResponse = (res, statusCode, responseHeaders, responseMessage) => {
  res.writeHead(statusCode, responseHeaders);
  res.end(responseMessage);
};

module.exports = {
  default: (req, res) => { 
      console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.default)`);
      headers['Content-Type'] = 'text/plain';
      sendResponse(res, 200, headers, 'Welcome the API server for Crustaceans thesis project!');
  },
  // Return ALL lists
  lists: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.lists)`);
    new List()
      .fetchAll()
      .then((lists) => {
            res.send(lists.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // Return ALL lists
  listsCreate: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.listsCreate)`);

    console.log('body.listName:', req.body);
    const newName = req.body.listName ? req.body.listName : 'Hello Jon.';

    new List(
      {
        name: newName,
        description: null
      })
      .save()
      .then((model) => {
        console.log('model:', model);
        return model.get('id');
      })
      .then((listId) => {
        return new List({ id: listId })
          .fetch({ withRelated: ['items'] })
          .then((list) => { 
            res.send(list.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
      });
  },
  // Return ALL items
  items: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.items)`);
    new Item()
      .fetchAll()
      .then((items) => {
            res.send(items.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  }, 
  // Return ALL lists, with ALL related items nested
  all: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.all)`);
    new List()
      .fetchAll({ withRelated: ['items'] })
      .then((lists) => { 
            res.send(lists.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
};
