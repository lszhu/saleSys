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

  if (!capital || !capital.money) {
    errors.capital = '资金流转记录有误';
    errors.err = true;
    return errors;
  }
  if (!capital.type) {
    errors.type = '未选定资金类型';
    errors.err = true;
  }
  if (!capital.stationId) {
    errors.stationId = '未选择部门';
  }
  if (!parseFloat(capital.money.value)) {
    errors.value = '收支金额有误';
  }
  if (!capital.money.type) {
    errors.moneyType = '资金种类有误';
  }
  if (!capital.money.currency) {
    errors.currency = '未设置货币种类';
  }
  var type = capital.type;
  if ((type == '员工预支' || type == '工资') && !capital.partnerId) {
    errors.partnerId = '未选定雇员';
  }
  if (capital.type && !capital.money.type || !capital.type && capital.money.type) {
    errors.type = '资金类型与其它选择有冲突';
    errors.accountType = '资金操作方式与其它选择有冲突';
  }
  if (Object.keys(errors).length) {
    errors.err = true;
  }

  return errors;
};