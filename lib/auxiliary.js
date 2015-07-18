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

// 格式化数字，保留两位小数
toDecimal2 = function(x) {
  if (isNaN(x)) {
    return '0.00';
  }
  var f = Math.round(x * 100) / 100;
  f = f.toString();
  var index = f.indexOf('.');
  if (index < 0) {
    return f + '.00';
  } else if (f.length == index + 2) {
    return f + '0';
  }
  return f;
};

// 移除货物清单中的空数据条目（空行）
trimGoodsList = function(goodsList) {
  var width = 7;
  var len = goodsList && goodsList.length;
  var data = [];
  var tmp;
  for (var i = 0; i < len; i++) {
    for (var j = 0; j < width; j++) {
      tmp = goodsList[i][j];
      if (tmp !== '' && tmp !== null && tmp !== undefined) {
        data.push(goodsList[i]);
        break;
      }
    }
  }
  return data;
};

//
createMessageContent = function(disposal) {
  if (!disposal) {
    return '';
  }
  var content = disposal.comment ? disposal.comment + '，' : '';
  var delivery = disposal.delivery;
  if (!delivery) {
    ;
  } else if (delivery.type == '出库') {
    content += '有商品出库，';
    content += delivery.comment ? delivery.comment + '，' : '';
  } else if (delivery.type == '入库') {
    content += '有商品入库，';
    content += delivery.comment ? delivery.comment + '，' : '';
  } else if (delivery.type == '其它') {
    content += delivery.comment + '，';
  }
  var capital = disposal.capital;
  if (!capital || !capital.type) {
    ;
  } else if (capital.money.value < 0 || capital.money.value > 0) {
    var value = Math.abs(capital.money.value);
    content += capital.type + (capital.money.value < 0 ? '支出' : '收入') +
        ' ' + capital.money.currency + toDecimal2(value) +
        ' ' + capital.money.type;
    content += capital.comment ? '，' + capital.comment + '。' : '。';
  }
  //console.log('disposal summary: ' + content);
  return content;
};

// 由订单及处理信息生成实时通知消息记录
autoMessageFromDisposal = function(orderId, disposal) {
  if (!orderId || !disposal) {
    return {};
  }
  var order = Orders.findOne(orderId);
  var customer = Customers.findOne(order.customer);
  customer = customer && customer.name || order.customer;
  var headline = customer;
  if (order.type == '销售' || order.type == '零售') {
    headline += '的订单：' + order.code;
  } else {
    headline = '从供应商' + customer + '的采购单：' + order.code;
  }

  return {
    //timestamp: new Date()
    type: disposal.type,
    creatorId: Meteor.userId(),
    receiverId: '',
    headline: headline,
    content: createMessageContent(disposal),
    priority: 1,
    read: false,
    manual: false
  };
};