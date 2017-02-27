const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'MyNewPass',  // set a password if needed
    database: 'thesis',  // Be sure to create DB on server
    charset: 'utf8'
  }
});
module.exports = require('bookshelf')(knex);
