const headers = require('./headers');

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
  create: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (requestHandlerAPI.create)`);
    knex.schema.createTable('lists', (table) => {  
        table.increments().primary();
        table.string('name');
        table.string('description');
        table.timestamps();
    })
    .createTable('items', (table) => {  
            table.increments().primary();
            table.string('name');
            table.string('description');
            table.timestamps();
            table.integer('list_id').unsigned().references('lists.id');
        })

    //////////////////////////////////////////////////////////
    // POPULATE LIST
    //////////////////////////////////////////////////////////
    .then(() => {
      return new List({ 
        name: 'Bills SF Spots', 
        description: 'Find these hidden spots in the city!!'
      })
      .save().then((model) => {
        return model.get('id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Golden Gate Bridge', 
        description: 'Most famous bridge on the planet.', 
        list_id: listId 
      }).save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Coit Tower', 
        description: 'A 210-foot (64 m) tower in the Telegraph Hill neighborhood.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Willie Mays Statue', 
        description: 'Youll find this one near McCovey Cove.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    //////////////////////////////////////////////////////////
    // END POPULATE LIST
    //////////////////////////////////////////////////////////
    
    //////////////////////////////////////////////////////////
    // POPULATE LIST
    //////////////////////////////////////////////////////////
    .then(() => {
      return new List({ 
        name: 'Jons Treats', 
        description: 'Can you find each treat?'
      })
      .save().then((model) => {
        return model.get('id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Red Bull', 
        description: 'Gives you wings.', 
        list_id: listId 
      }).save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Gummi Bears', 
        description: 'If any are left.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Monster Energy Drink', 
        description: 'When Red Bull is not enough.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    //////////////////////////////////////////////////////////
    // END POPULATE LIST
    //////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////
    // POPULATE LIST
    //////////////////////////////////////////////////////////
    .then(() => {
      return new List({ 
        name: 'Dan\'s Favorites', 
        description: 'Locate them all!'
      })
      .save().then((model) => {
        return model.get('id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Daughter\'s Day Care', 
        description: 'Be aware ... they may have moved.', 
        list_id: listId 
      }).save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Hack Reactor', 
        description: 'Find the logo at the top of the stairs on 8th floor.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    .then((listId) => {
      console.log('model: ', listId);
      return new Item({ 
        name: 'Park Bench', 
        description: 'Dan loves this spot.', 
        list_id: listId 
      })
      .save().then((model) => {
        return model.get('list_id');
      });
    })
    //////////////////////////////////////////////////////////
    // END POPULATE LIST
    //////////////////////////////////////////////////////////

    .then((resp) => {
      console.log('RESp', resp);
      res.send('DB Created');
    })
    .catch((err) => {
      console.log('ERROR:', err);
      res.send(err);
    });
    //res.send('DB Created');
  }, 
  delete: (req, res) => {
    knex.schema.dropTable('items')
        .dropTable('lists').then(() => {
          res.send('DB Cleared');
        });
  }
};
