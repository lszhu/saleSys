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
    var currentUser = Meteor.user();

    if (currentUser.username == account.username &&
        (account.disabled == '1' || currentUser.grade != account.grade)) {
      throw new Meteor.Error('invalid_account_update',
          '不能禁用当前用户或修改当前用户的等级');
    }

    if ((!account.username || !account.email || !account.password) && !data.overlap) {
      throw new Meteor.Error('invalid_account', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      if (account.password) {
        Accounts.setPassword(data.overlap, account.password);
      }
      account = _.omit(account, 'password');
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
