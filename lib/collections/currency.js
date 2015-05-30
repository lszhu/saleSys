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

    var currency = data.currency;
    //var user = Meteor.user();
    //var post = Posts.findOne(currencyAttributes.postId);

    if (!currency.symbol || !currency.name || !currency.rate) {
      throw new Meteor.Error('invalid-currency', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      currency = _.extend(currency, {timestamp: new Date()});
      Currencies.update(data.overlap, currency);
      return;
    }

    // 创建新currency时，货币符号不能重复
    var exist = Currencies.findOne({symbol: currency.symbol});
    if (exist) {
      throw new Meteor.Error('exist_currency', '货币符号重复');
    }

    currency = _.extend(currency, {timestamp: new Date()});

    // 新增currency条目
    currency._id = Currencies.insert(currency);
    //currency._id = Currencies.upsert({name: currency.name}, currency);

    return currency._id;
  },

  currencyRemove: function (objectId) {
    check(objectId, String);
    Currencies.remove(objectId);
  }
});
