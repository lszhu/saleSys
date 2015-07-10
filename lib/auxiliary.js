// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
};

// 将出错信息逐个连接起来并返回
getErrorMessage = function(errors) {
  if (!errors.err) {
    return '';
  }
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
  d = new Date(d);
  if (d.toString == 'Invalid Date') {
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
  d = new Date(d);
  if (d.toString == 'Invalid Date') {
    return '';
  }
  return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
};

// 移除货物清单中的空数据条目（空行）
trimGoodsList = function(goodsList) {
  var width = 7;
  var len = goodsList && goodsList.length;
  var data = [];
  for (var i = 0; i < len; i++) {
    for (var j = 0; j < width; j++) {
      if (goodsList[i][j] != '') {
        data.push(goodsList[i]);
        break;
      }
    }
  }
  return data;
};