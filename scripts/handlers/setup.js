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

module.exports = {
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
