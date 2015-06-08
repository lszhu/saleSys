Meteor.methods({
  accountInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      account: {
        username: String,
        nickname: String,
        email: String,
        password: String,
        disabled: String,
        stationId: String,
        grade: Number,
        comment: String
      },
      overlap: String
    });

    var Users = Meteor.users;
    var account = data.account;

    // 更新条目情况的处理
    if (data.overlap) {
      if (account.password) {
        Accounts.setPassword(data.overlap, account.password);
      }
      account = _.omit(account, 'password');
      // 如果要更改邮箱，需要特殊处理
      if (account.email) {
        account.emails = [{address: account.email}];
        account = _.omit(account, 'email');
      }
      // 如果是当前用户，不允许更改：'disabled', 'stationId', 'grade'
      if (Meteor.userId() == data.overlap) {
        account = _.omit(account, ['disabled', 'stationId', 'grade']);
      }
      Users.update(data.overlap, {$set: account});
      return;
    }

    // 创建新account时，不允许覆盖已有同账号名的条目
    var exist = Users.findOne({username: account.model});
    if (exist) {
      throw new Meteor.Error('exist_account', '已经存在同名账号');
    }

    var userId = Accounts.createUser(account);
    //console.log('_id: ' + account.stationId);
    account = _.omit(account, ['username', 'password', 'email']);
    Meteor.users.update(userId, {$set: account});

    return userId;
  },

  accountRemove: function (objectId) {
    check(objectId, String);
    if (objectId == Meteor.userId()) {
      throw new Meteor.Error('invalid-account-remove', '不能删除当前账号');
    }
    Meteor.users.remove(objectId);
  }
});
