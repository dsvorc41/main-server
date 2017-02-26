const headers = require('../headers');

const bookshelf = require('../bookshelf');

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
      console.log(`Serving ${req.method} request for ${req.url} (handlers/api.default)`);
      headers['Content-Type'] = 'text/plain';
      sendResponse(res, 200, headers, 'Welcome the API server for Crustaceans thesis project!');
  },
  // Return ALL lists
  lists: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.lists)`);
    new List()
      .fetchAll()
      .then((lists) => {
            res.send(lists.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // DELETE a List
  listsDelete: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsDelete)`);

    const listId = req.params.list_id;

    new Item()
      .where('list_id', listId)
      .destroy()
      .then((model) => {
            console.log('List Items Deleted:', model);
            new List({ id: listId })
              .destroy()
              .then(() => {
                console.log('FULL LIST DELETED');
                new List()
                  .fetchAll({ withRelated: ['items'] })
                  .then((lists) => { 
                        res.send(lists.toJSON());
                      }).catch((error) => {
                        console.log(error);
                        res.send('An error occured');
                      });
              });
          })
      .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // Create New list
  listsCreate: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsCreate)`);

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
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.items)`);
    new Item()
      .fetchAll()
      .then((items) => {
            res.send(items.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  }, 
  // Create New list
  itemsCreate: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.itemsCreate)`);

    console.log('body:', req.body);
    //const newName = req.body.listName ? req.body.listName : 'Hello Jon.';

    new Item(
      {
        name: req.body.name,
        description: req.body.desc, 
        list_id: req.body.listId, 
        image: req.body.image
      })
      .save()
      .then((model) => {
        console.log('model:', model);
        return model.get('id');
      })
      .then(() => {
        return new List({ id: req.body.listId })
          .fetch({ withRelated: ['items'] })
          .then((list) => { 
            res.send(list.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
      });
  },
  itemsDelete: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.itemsDelete)`);

    const itemId = req.params.item_id;
    const listId = req.params.list_id;

    new Item({ id: itemId })
      .destroy()
      .then(() => {
            console.log('Item Deleted:', itemId);

            new List({ id: listId })
              .fetch({ withRelated: ['items'] })
              .then((list) => { 
                res.send(list.toJSON());
              }).catch((error) => {
                console.log(error);
                res.send('An error occured');
              });
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          })
      .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  itemsFound: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.itemsFound)`);

    console.log('BODY', req.body.item);


    const itemId = req.body.item.id;
    const listId = req.body.item.list_id;
    console.log('ID ON SERVER', itemId);
    new Item({ id: itemId })
      .save({ complete: 1 }, { patch: true })
      .then(() => {
            console.log('Item Deleted:', itemId);

            new List({ id: listId })
              .fetch({ withRelated: ['items'] })
              .then((list) => { 
                res.send(list.toJSON());
              }).catch((error) => {
                console.log(error);
                res.send('An error occured');
              });
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          })
      .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // Return ALL lists, with ALL related items nested
  all: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.all)`);
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
