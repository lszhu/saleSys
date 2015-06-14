Currencies = new Mongo.Collection('currencies');

Meteor.methods({
  currencyInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      currency: {
        symbol: String,
        name: String,
        country: String,
        rate: Number,
        memo: String
      },
      overlap: String
    });

    // 验证数据
    var errors = validateCurrency(data);
    if (errors.err) {
      throw new Meteor.Error('invalid-currency', getErrorMessage(errors));
    }

    //var user = Meteor.user();

    var currency = data.currency;
    currency = _.extend(currency, {timestamp: new Date()});
    // 更新条目情况的处理
    if (data.overlap) {
      Currencies.update(data.overlap, currency);
      return;
    } else {
      // 新增currency条目
      return Currencies.insert(currency);
    }

    //currency._id = Currencies.insert(currency);
    //currency._id = Currencies.upsert({name: currency.name}, currency);
    //return currency._id;
  },

  currencyRemove: function (objectId) {
    check(objectId, String);
    Currencies.remove(objectId);
  }
});

validateCurrency = function(data) {
  var currency = data.currency;
  var errors = {};
  if (!currency.name) {
    errors.name = '货币名称为空';
    errors.err = true;
  }
  if (!currency.symbol) {
    errors.symbol = '货币符号为空';
    errors.err = true;
  }
  if (!currency.rate) {
    errors.rate = '货币兑美元汇率为空';
    errors.err = true;
  }
  if (data.overlap || errors.err) {
    return errors;
  }
  // 以下内容针对新建货币条目情况（data.overlap为空时）
  if (Currencies.findOne({name: currency.name})) {
    errors.name = '货币名称已存在';
    errors.err = true;
  }
  if (Currencies.findOne({symbol: currency.symbol})) {
    errors.symbol = '货币符号已存在';
    errors.err = true;
  }
  return errors;
};
