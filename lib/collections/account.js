validateAccount = function (post) {
  var errors = {};
  var account = post.account;
  //console.log('account: ' + JSON.stringify(account));

  if (!account.username) {
    errors.username = '账号名称不能为空';
    errors.err = true;
  }
  if (Meteor.users.findOne({username: account.username})) {
    errors.username = '已经存在同名的用户账号';
    errors.err = true;
  }
  if (!post.overlap) {
    if (!account.nickname) {
      errors.nickname = '请正确填写用户名称';
      errors.err = true;
    }
    if (!account.email) {
      errors.email = '请正确填写用户名称';
      errors.err = true;
    }
    if (!account.password) {
      errors.password = '请正确输入密码';
      errors.err = true;
    }
  } else if (post.overlap == Meteor.userId()) {
    var curUser = Meteor.user();
    if (account.disabled == '1') {
      errors.disabled = '不能禁用当前登录账号';
      errors.err = true;
    }
    if (account.stationId != curUser.stationId) {
      errors.stationId = '不能更改当前登录账号所属部门';
      errors.err = true;
    }
    if (account.grade != curUser.grade) {
      errors.grade = '不能更改当前登录账号的等级';
      errors.err = true;
    }
  }

  return errors;
};

