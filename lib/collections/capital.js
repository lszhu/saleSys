Capitals = new Mongo.Collection('capitals');

Meteor.methods({
  capitalInsert: function(capital) {
    check(capital, {
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

    var errors = validateCapital(capital);
    if (errors.err) {
      throw new Meteor.Error('invalid-capital', getErrorMessage(errors));
    }
    capital.timestamp = new Date();
    return Capitals.insert(capital);
  },

  capitalUpdate: function(objectId, capital) {
    check(objectId, String);
    check(capital, {
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
    var errors = validateCapital(capital);
    if (errors.err) {
      throw new Meteor.Error('invalid-capital', getErrorMessage(errors));
    }
    capital.timestamp = new Date();
    return Capitals.update(objectId, capital);

  },

  capitalRemove: function(objectId) {
    check(objectId, String);
    Capitals.remove(objectId);
  }
});

validateCapital = function(capital) {
  var errors = {};

  if (!capital) {
    errors.capital = '资金流转记录有误';
    errors.err = true;
  }
  if (capital.type && !capital.money.type || !capital.type && capital.money.type) {
    errors.type = '资金类型与其它选择有冲突';
    errors.accountType = '资金操作方式与其它选择有冲突';
    errors.err = true;
  }

  return errors;
};