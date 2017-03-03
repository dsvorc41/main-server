const bookshelf = require('./db').bookshelf;

const models = {};

models.User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  lists: function () {
    return this.hasMany(models.List);
  },
  // items: function () {
  //   return this.hasMany(Item);
  // },
});

models.List = bookshelf.Model.extend({
  tableName: 'lists',
  hasTimestamps: true,
  items: function () {
    return this.hasMany(models.Item);
  },
  user: function () {
    return this.belongsTo(models.User);
  }
});

models.Item = bookshelf.Model.extend({
  tableName: 'items',
  hasTimestamps: true,
  list: function () {
    return this.belongsTo(models.List);
  },
  done: function () {
    return this.hasOne(models.Done);
  }
  // users: function() {
  //   return this.belongsToMany(User);
  // }
});

models.Done = bookshelf.Model.extend({
  tableName: 'users_items',
  hasTimestamps: true,
  item: function () {
    return this.belongsTo(models.Item);
  },
});

module.exports = models;
