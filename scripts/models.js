const bookshelf = require('./db').bookshelf;

const models = {};

models.User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  lists: function () {
    return this.hasMany(models.List);
  },
  subscriptions: function () {
    return this.hasMany(models.Subscription);
  }

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
  },
  subscriptions: function () {
    return this.hasMany(models.Subscriptions);
  },
  completed: function () {
    return this.hasMany(models.Complete);
  }
});

models.Item = bookshelf.Model.extend({
  tableName: 'items',
  hasTimestamps: true,
  list: function () {
    return this.belongsTo(models.List);
  },
  complete: function () {
    return this.hasOne(models.Complete);
  },
  subscriptions: function () {
    return this.belongsTo(models.Subscriptions);
  },
  // users: function() {
  //   return this.belongsToMany(User);
  // }
});

models.Complete = bookshelf.Model.extend({
  tableName: 'users_items',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(models.User);
  },
  list: function () {
    return this.belongsTo(models.List);
  },
  item: function () {
    return this.belongsTo(models.Item);
  },
});

models.Subscription = bookshelf.Model.extend({
  tableName: 'users_lists',
  hasTimestamps: true,
  list: function () {
    return this.belongsTo(models.List);
  },
  user: function () {
    return this.belongsTo(models.User);
  },
});

module.exports = models;
