Users = Meteor.users;

Meteor.methods({
  accountInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      account: {
        code: String,
        name: String,
        model: String,
        batch: String,
        price: {value: Number, currency: String},
        comment: String,
        memo: String
      },
      overlap: String
    });

    var account = data.account;
    //var account = Meteor.user();

    if (!account.username || !account.name || !account.model) {
      throw new Meteor.Error('invalid_account', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      account = _.extend(account, {timestamp: new Date()});
      Users.update(data.overlap, account);
      return;
    }

    // 创建新account时，不允许覆盖已有同型号且同批次的条目
    var exist = Users.findOne({model: account.model, batch: account.batch});
    if (exist) {
      throw new Meteor.Error('exist_account', '已有同型号且同批次的产品型号');
    }

    account = _.extend(account, {timestamp: new Date()});

    // 新增account条目
    account._id = Users.insert(account);
    //account._id = Users.upsert({name: account.name}, account);

    return account._id;
  },

  accountRemove: function (objectId) {
    check(objectId, String);
    Users.remove(objectId);
  }
});
