// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
};

// 将出错信息逐个连接起来并返回
getErrorMessage = function(errors) {
  return _.chain(errors).omit('err').values().value().join('，');
};

// 判断当前登录账号是否为管理员账号
isAdministrator = function() {
  var user = Meteor.user();
  //console.log('user: ' + JSON.stringify(user));
  return user && user.grade == '3';
};

// 判断当前登录账号是否为特权用户账号
isSuperUser = function() {
  var user = Meteor.user();
  //console.log('user: ' + JSON.stringify(user));
  return user && user.grade >= '2';
};

// 将时间格式化为YYYYY-MM-DD的格式
formatDate = function(d) {
  if (!d) {
    return '';
  }
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  var day = d.getDate();
  day = day < 10 ? '0' + day : day;
  return year + '-' + month + '-' + day;
};

// 将时间格式化为HH:MM:SS的格式
formatTime = function(d) {
  if (!d) {
    return '';
  }
  return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
};