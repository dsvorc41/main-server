const headers = require('../headers');
//const bookshelf = require('../bookshelf');
const { User, List, Item } = require('../models');
//const Done = require('../models').Done;

// // Our Models
// const User = bookshelf.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   lists: function () {
//     return this.hasMany(List);
//   },
//   // items: function () {
//   //   return this.hasMany(Item);
//   // },
// });

// const List = bookshelf.Model.extend({
//   tableName: 'lists',
//   hasTimestamps: true,
//   items: function () {
//     return this.hasMany(Item);
//   },
//   user: function () {
//     return this.belongsTo(User);
//   }
// });

// const Item = bookshelf.Model.extend({
//   tableName: 'items',
//   hasTimestamps: true,
//   list: function () {
//     return this.belongsTo(List);
//   },
//   done: function () {
//     return this.hasOne(Done);
//   }
//   // users: function() {
//   //   return this.belongsToMany(User);
//   // }
// });

// const Done = bookshelf.Model.extend({
//   tableName: 'users_items',
//   hasTimestamps: true,
//   item: function () {
//     return this.belongsTo(Item);
//   },
// });


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
  // Return ALL lists for user
  getUserId: (user, callback) => { 
    console.log('Serving internal request for (handlers/api.getUserId)');

    new User({ firebase_id: user.uid })
      .fetch()
      .then((model) => {
        const userId = model.get('id');
        const obj = {
          user_id: userId, 
          fb: user
        };
        callback(obj);
      })
      .catch((error) => {
            console.log('ERROR:', error);
          });
  },
  // Return ALL lists for user
  listsUser: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsUser)`);

    const userId = req.params.userId;
    console.log('userId', userId);

    new User()
      .where('id', userId)
      .fetch({ withRelated: ['lists.items', {
        'lists.items.done': function (qb) { 
          qb.innerJoin('users', 'users_items.user_id', 'users.id');
          qb.where('users.id', userId); 
        }
        }] })
      .then((user) => {
            const output = user.toJSON();
            res.send(output.lists);
          })
      .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // DELETE a List
  listsDelete: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsDelete)`);

    const listId = req.params.list_id;
    console.log('this.all', module.exports.all);
    new List({ id: listId })
      .save({ user_id: 1 }, { patch: true })
      .then((model) => {
            console.log('List Items Deleted:', model);

            //this.all(req, res);
            new List()
              .fetchAll({ withRelated: ['items'] })
              .then((lists) => { 
                    res.send(lists.toJSON());
                  }).catch((error) => {
                    console.log(error);
                    res.send('An error occured');
                  });
          })
      .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
  // DELETE a List
  listsDelete2: (req, res) => { 
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
  // Create Users -- from requestHandler
  usersCreate: (user) => { 
    console.log('Serving direct request for (handlers/api.usersCreate)');

    //console.log('user:', user);
    //const newName = req.body.listName ? req.body.listName : 'Hello Jon.';

    new User(
      {
        email: user.email,
        firebase_id: user.uid,
      })
      .save()
      .then(() => {
        console.log('New User Created in DB:');
        return;
      });
  },

  // Create Users -- from requestHandler
  usersDelete: (user) => { 
    console.log('Serving direct request for (handlers/api.usersDelete)', user.uid);

    new User()
      .where('firebase_id', user.uid)
      .destroy()
      .then(() => {
        console.log('User Deleted from Local DB');
        return;
      });
  },

  // Create New list
  listsCreate: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsCreate)`);

    const newName = req.body.listName ? req.body.listName : 'Hello Jon.';
    const userId = parseInt(req.body.user, 10);

    new List(
      {
        name: newName,
        description: null,
        user_id: userId
      })
      .save()
      .then((model) => {
        //console.log('model:', model);
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

    new Item(
      {
        name: req.body.name,
        description: req.body.desc, 
        list_id: req.body.listId, 
        image: req.body.image
      })
      .save()
      .then((model) => {
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
    const itemId = req.body.item.id;
    const listId = req.body.item.list_id;

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
