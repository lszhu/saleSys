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

    // 如果系统中存在账号，而用户又未登录，则不运行操作账号
    if (!Meteor.userId() && Meteor.users.find().count() > 0) {
      throw new Meteor.Error('unauthorized-user', '非授权用户');
    }

    var errors = validateAccount(data);
    if (errors.err) {
      throw new Meteor.Error('invalid-user', getErrorMessage(errors));
    }
    // 不允许账号名称为空
    //if (!account.username) {
    //  throw new Meteor.Error('account-empty-username', '账号名称不能为空');
    //}
    // 创建新用户的情况
    if (!data.overlap) {
      var userId = Accounts.createUser(account);
      //console.log('_id: ' + account.stationId);
      account.profile = {
        name: account.nickname,
        // 创建用户账号时，默认使用货币类型为人民币元（CNY）
        currency: 'CNY',
        stationId: account.stationId
      };
      account = _.omit(account, ['username', 'password', 'email', 'nickname']);
      Meteor.users.update(userId, {$set: account});
      return userId;
    }
    // 更新条目情况的处理
    if (account.password) {
      // 如果是当前用户则直接在客户端设置密码
      // 这里只有不是当前用户才能再次设置密码
      if (data.overlap != Meteor.userId()) {
        Accounts.setPassword(data.overlap, account.password);
      }
    }
    account = _.omit(account, 'password');
    // 如果要更改邮箱，需要特殊处理
    if (account.email) {
      account.emails = [{address: account.email}];
      account = _.omit(account, 'email');
    }
    // 对用户昵称（或真实姓名）进行处理
    Meteor.users.update(userId, {$set: {'profile.name': account.nickname}});
    account = _.omit(account, 'nickname');
    // 如果是当前用户，不允许更改：'disabled', 'stationId', 'grade'
    if (Meteor.userId() == data.overlap) {
      account = _.omit(account, ['disabled', 'stationId', 'grade']);
    }
    // 对默认显示的所属部门Id进处理
    if (account.stationId) {
      Meteor.users.update(userId,
          {$set: {'profile.stationId': account.stationId}});
    }
    Users.update(data.overlap, {$set: account});
  },

  accountRemove: function (objectId) {
    check(objectId, String);
    if (objectId == Meteor.userId()) {
      throw new Meteor.Error('invalid-account-remove', '不能删除当前账号');
    }
    Meteor.users.remove(objectId);
  },

  getNameById: function(userId) {
    check(userId, String);
    var user = Meteor.users.findOne(userId);
    return user && user.profile && user.profile.name;
  }
});

// 在对登录进行验证前，先验证本次登录尝试是否有效，有效则返回真值
Accounts.validateLoginAttempt(function (l) {
  //console.log('user name: ' + l.user && l.user.name);
  if (l.user && l.user.retry >= 3) {
    throw new Meteor.Error('login-retry-timeout', '密码连续错误超过3次');
  }
  if (l.user && l.user.disabled == '1') {
    throw new Meteor.Error('login-invalid-account', '无效的账号名或密码');
  }
  return true;
});

// 登录成功，则重置该账号的错误尝试次数
Accounts.onLogin(function (l) {
  Meteor.users.update(l.user._id, {$set: {retry: 0}});
});

// 登录失败时，如果存在该用户，则将登录错误尝试次数加一
// 如果超过三次则禁用，并同时清零错误登录尝试次数
Accounts.onLoginFailure(function (l) {
  if (!l.user || !l.user._id) {
    return;
  }
  Meteor.users.update(l.user._id, {$inc: {retry: 1}});
  var times = Meteor.users.findOne(l.user._id);
  if (times && times.retry >= 3) {
    Meteor.users.update(l.user._id, {$set: {disabled: '1', retry: 0}});
  }
});
