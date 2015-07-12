Messages = new Mongo.Collection('messages');

Meteor.methods({
  messageInsert: function(message) {
    check(message, {
      type: String,
      stationId: String,
      orderId: String,
      money: {
        type: String,
        value: Number,
        currency: String
      },
      comment: String,
      partnerId: String,
      operatorId: String
    });

    var errors = validateMessage(message);
    if (errors.err) {
      throw new Meteor.Error('invalid-message', getErrorMessage(errors));
    }
    message.timestamp = new Date();
    return Messages.insert(message);
  },

  messageUpdate: function(objectId, message) {
    check(objectId, String);
    check(message, {
      type: String,
      stationId: String,
      orderId: String,
      money: {
        type: String,
        value: Number,
        currency: String
      },
      comment: String,
      partnerId: String,
      operatorId: String
    });
    var errors = validateMessage(message);
    if (errors.err) {
      throw new Meteor.Error('invalid-message', getErrorMessage(errors));
    }
    message.timestamp = new Date();
    return Messages.update(objectId, message);
  },

  messageRemove: function(objectId) {
    check(objectId, String);
    Messages.remove(objectId);
  }
});

validateMessage = function(message) {
  var errors = {};

  if (!message) {
    errors.message = '资金流转记录有误';
    errors.err = true;
  }
  if (message.type && !message.money.type || !message.type && message.money.type) {
    errors.type = '资金类型与其它选择有冲突';
    errors.accountType = '资金操作方式与其它选择有冲突';
    errors.err = true;
  }

  return errors;
};