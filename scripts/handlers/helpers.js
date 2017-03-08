const { User, List, Item, Subscription, Complete } = require('../models');

// Increase and Decrease Subscriber Count in List Table
const changeSubscriberCount = (listId, val) => {
  console.log('Helper request for (changeSubscriberCount)');
  return new List()
    .where('id', listId)
    .fetch()
    .then((model) => {
      return model.get('subscribers') + val;
    })
    .then((subs) => {
      return new List({ id: listId })
        .save({ subscribers: subs }, { patch: true })
        .then(() => {
          return listId;
        });
    });
};

// RETURN LIST (FOR USER) WITH COMPLETED INCLUDED
const getUserList = (userId, listId) => {
  return new List({ id: listId })
    .fetch({ withRelated: ['items', {
      'items.complete': function (qb) { 
        qb.innerJoin('users', 'users_items.user_id', 'users.id');
        qb.where('users.id', userId); 
      }
      }] 
    }); 
};

module.exports.changeSubscriberCount = changeSubscriberCount;
module.exports.getUserList = getUserList;

