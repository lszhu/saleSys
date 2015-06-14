validateAccount = function (post) {
  var errors = {};
  var account = post.account;
  var overlap = post.overlap;
  //console.log('account: ' + JSON.stringify(account));

  if (!account.username) {
    errors.username = '未设置账号名称';
    errors.err = true;
  }
  if (!account.nickname) {
    errors.nickname = '未设置用户姓名';
    errors.err = true;
  }
  if (!account.email) {
    errors.email = '未设置电子邮箱';
    errors.err = true;
  }
  if (errors.err) {
    return errors;
  }

  if (!post.overlap) {
    if (!account.password) {
      errors.password = '未设置有效的密码';
      errors.err = true;
    }
  } else if (post.overlap == Meteor.userId()) {
    var curUser = Meteor.user();
    if (account.username != curUser.username) {
      errors.username = '不能更改当前登录账号名称';
      errors.err = true;
    }
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

  var a = Meteor.users.findOne({username: account.username});
  if (a && a._id != overlap) {
    errors.username = '已经存在同名的用户账号';
    errors.err = true;
  }
  return errors;
};
