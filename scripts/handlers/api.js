const headers = require('../headers');
const { User, List, Item, Subscription, Complete } = require('../models');
const { changeSubscriberCount, getUserList } = require('./helpers');

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

  // NEW ONE
  // Return ALL lists for user
  //
  listsUser: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listsUser)`);

    const userId = req.params.userId;
    //const userId = 1;

    new User()
      .where('id', userId)
      .fetch({ withRelated: ['subscriptions.list.items', {
        'subscriptions.list.items.complete': function (qb) { 
          qb.innerJoin('users', 'users_items.user_id', 'users.id');
          qb.where('users.id', userId); 
        }
        }] 
      })
      .then((user) => {
            const output = user.toJSON();
            res.send(output.subscriptions);
          })
      .catch((error) => {
            console.log('ERROR:', error);
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
  
  // Create Users -- from requestHandler
  usersCreate: (user, callback) => { 
    console.log('Serving direct request for (handlers/api.usersCreate)');

    new User(
      {
        email: user.email,
        firebase_id: user.uid,
      })
      .save()
      .then((model) => {
        return new Subscription({
          user_id: model.get('id'),
          list_id: 1
        })
        .save()
        .then(() => {
          return model;
        });
      })
      .then((model) => {
        const userId = model.get('id');
        const obj = {
          user_id: userId, 
          fb: user
        };
        console.log('New User Created ID:', obj.user_id);
        callback(obj);
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
    const userId = parseInt(req.body.userID, 10);

    new List(
      {
        name: newName,
        description: null,
        user_id: userId
      })
      .save()
      .then((model) => {
        const listId = model.get('id');
        return new Subscription(
          {
            user_id: userId,
            list_id: listId
          })
          .save()
          .then((model2) => {
            return model2.get('list_id');
          });
      })
      .then((listId2) => {
        return changeSubscriberCount(listId2, 1);
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

  // SUBSCRIBE USER TO LIST
  subscribeUserToList: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.subscribeUserToList)`);

    console.log('req.body', req.body);

    const userId = parseInt(req.body.user, 10);
    const listId = parseInt(req.body.list, 10);

    new Subscription()
      .where({
        user_id: userId,
        list_id: listId
      })
      .count()
      .then((count) => {
        if (count > 0) {
          console.log('DUPLICATE SUBSCRIPTION');
          return new List({ id: listId })
            .fetch({ withRelated: ['items'] })
            .then((list) => { 
              res.send(list.toJSON());
            }).catch((error) => {
              console.log(error);
              res.send('An error occured');
            });
        } 

        new Subscription()
          .save({
            user_id: userId,
            list_id: listId
          })
          .then((model) => {
            return model.get('list_id');
          })
          .then(() => {
            return changeSubscriberCount(listId, 1);
          })
          .then((listId1) => {
            return new List({ id: listId1 })
              .fetch({ withRelated: ['items'] })
              .then((list) => { 
                res.send(list.toJSON());
              }).catch((error) => {
                console.log(error);
                res.send('An error occured');
              });
          })
          .catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
      })
      .catch((error) => {
        console.log(error);
        res.send('An error occured');
      });
  },

  // SUBSCRIBE USER TO LIST
  unSubscribeUserFromList: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.unSubscribeUserFromList)`);

    const userId = parseInt(req.params.user_id, 10);
    const listId = parseInt(req.params.list_id, 10);

    new Complete()
      .where({ user_id: userId, list_id: listId })
      .destroy()
      .then(() => {
        new Subscription()
          .where({ user_id: userId, list_id: listId })
          .destroy()
          .then(() => {
            return changeSubscriberCount(listId, -1);
          })
          .then(() => {
            new User()
              .where('id', userId)
              .fetch({ withRelated: ['subscriptions.list.items', {
                'subscriptions.list.items.complete': function (qb) { 
                  qb.innerJoin('users', 'users_items.user_id', 'users.id');
                  qb.where('users.id', userId); 
                }
                }
                ] })
              .then((user) => {
                    const output = user.toJSON();
                    res.send(output.subscriptions);
                  })
              .catch((error) => {
                    console.log('ERROR:', error);
                    res.send('An error occured');
                  });
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
        image: req.body.image,
        imageURL: req.body.imageURL,
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

  ////////////////////////////////////////////////////////////////
  // REFACTOR TO USER SPECIFIC NEW WAY
  ////////////////////////////////////////////////////////////////

  // OLD GLOBAL WAY TO CHECK OFF ITEM
  itemsFound: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.itemsFound)`);
    
    const itemId = req.body.item.id;
    const listId = req.body.item.list_id;
    const userId = req.body.user_id; // need to send this
    const complete = req.body.complete;
    // const complete = 1;
    // const itemId = 3;
    // const listId = 1;
    // const userId = 2;

    console.log(`VARS: complete = ${complete}, itemId = ${itemId}, 
      listId = ${listId}, userId = ${userId}`);

    if (complete === 0) {
      console.log('Item NOT Deleted, no match:', itemId);
      getUserList(userId, listId)
        .then((list) => { 
          res.send(list.toJSON());
        });
    } else {
      new Complete()
        .save({ user_id: userId, list_id: listId, item_id: itemId })
        .then(() => {
          console.log('Item Deleted:', itemId);
          return getUserList(userId, listId);
        })
        .then((list) => { 
          res.send(list.toJSON());
        })
        .catch((error) => {
          console.log(error);
          res.send('An error occured');
        });
    }
  },
  // Return ALL lists, with ALL related items nested
  all: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.all)`);
    new List()
    .orderBy('subscribers', 'DESC')
      .fetchAll({ withRelated: ['items'] })
      .then((lists) => { 
            console.log('asdf', lists);
            res.send(lists.toJSON());
          }).catch((error) => {
            console.log(error);
            res.send('An error occured22');
          });
  },

  // Return ALL lists, with ALL related items nested
  listStats: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listStats)`);

    const listId = req.params.list_id;

    new List()
      .where({ id: listId })
      .fetchAll({ withRelated: ['completed.item'] })
      .then((lists) => { 
        res.send(lists.toJSON());
      })
      .catch((error) => {
        console.log(error);
        res.send('An error occured');
      });
  },

  // Return ALL lists, with ALL related items nested
  userStats: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.listStats)`);

    const userId = req.params.user_id;
    const output = {};

    new List()
      .where({ user_id: userId })
      .count()
      .then((count) => { 
        output.listCount = count;
      })
      .then(() => {
        return new Subscription()
          .where({ user_id: userId })
          .count()
          .then((subscriptions) => {
            output.subscriptionCount = subscriptions;
            return;
          });
      })
      .then(() => {
        return new Complete()
          .where({ user_id: userId })
          .count()
          .then((completes) => {
            output.completeCount = completes;
            return;
          });
      })
      .then(() => {
        res.send(JSON.stringify(output));
      })
      .catch((error) => {
        console.log(error);
        res.send('An error occured');
      });
  },

  // Route used for testing purposes
  test: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (handlers/api.test)`);
    new List()
      .where('id', 5)
      .count()
      .then((count) => { 
            console.log('RESULT: ', count);
            const lists = { counter: count };
            res.send('asdfsda');
          }).catch((error) => {
            console.log(error);
            res.send('An error occured');
          });
  },
};
