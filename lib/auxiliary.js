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

// 通过订单处理内容创建自动消息
createMessageContent = function(disposal) {
  if (!disposal) {
    return '';
  }
  var content = disposal.type ? disposal.type + '：' : '';
   content += disposal.comment ? disposal.comment + '，' : '';
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
    headline += '销售订单（' + order.code + '）';
  } else {
    headline = customer + ' - 采购定单（' + order.code + '）';
  }

  return {
    //timestamp: new Date(),
    //creatorId: Meteor.userId(),
    //read: false,
    type: disposal.type,
    receiverId: '',
    headline: headline,
    content: createMessageContent(disposal),
    priority: '1',
    manual: false
  };
};

// 将类似{CNY: 2352, USD: 5234}转换为'CNY2352.00, USD5234.00'
concatCurrency = function (currency) {
  var result = [];
  for (var i in currency) {
    if (!currency.hasOwnProperty(i)) {
      continue;
    }
    result.push(i + toDecimal2(currency[i]));
  }
  return result.join(', ');
};

// 由2015-08-22的日期格式生成Date对象（期限包含当天）
parseDeadline = function (d) {
  if (!d) {
    return new Date();
  }
  var t = d.split('-');
  console.log('t: ' + t);
  // 将日期增加一天，以便包含当天
  t = new Date(t[0], +t[1] - 1, +t[2] + 1);
  return t == 'Invalid Date' ? new Date() : t;
};

// 返回一年前的今天
yearAgo = function() {
  var now = new Date();
  now = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return formatDate(now);
};

// 由时间阶段名称变为具体查询条件
// 时间阶段名称有效值包含：today, yesterday, month, pre-month, 30days, year
setTimeSpan = function(period) {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var date = now.getDate();
  var start, end;

  switch (period) {
    case 'today':
      start = new Date(year, month, date);
      end = now;
      break;
    case 'yesterday':
      start = new Date(year, month, date - 1);
      end = new Date(year, month, date);
      break;
    case 'month':
      start = new Date(year, month, 1);
      end = now;
      break;
    case 'pre-month':
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
      break;
    case '30days':
      // 表示最近30天的订单
      start = new Date(year, month, date - 30);
      end = now;
      break;
    case 'year':
      start = new Date(year, 0, 1);
      end = now;
      break;
    default:
      return {};
  }
  return {timestamp: {$gte: start, $lt: end}};
};

// 通过订单的code及disposal的timestamp和index生成订单处理编号
orderDisposalId = function(code, timestamp, index) {
  if (!timestamp) {
    timestamp = new Date();
  }
  var id = code + '';
  var ms = timestamp.getMilliseconds();
  if (ms > 99) {
    id += ms;
  } else if (ms > 9) {
    id += '0' + ms;
  } else {
    id += '00' + ms;
  }
  if (index > 99) {
    id += index % 1000;
  } else if (index > 9) {
    id += '0' + index;
  } else if (index >= 0) {
    id += '00' + index;
  } else {
    // 出现异常的情况
    id += Math.floor(Math.random() * 1000)
  }
  return id;
};

// 由日期参数返回UTC年月字符串（yyyymm），否则返回'error'
subPath = function(t) {
  if (!t) {
    return 'error';
  }
  var y = t.getUTCFullYear() + '';
  var m = t.getUTCMonth() + 1;
  m = m > 9 ? m : '0' + m;
  return y + m;
};

// 随机生成n个字符序列
// c为digit、uppercase、lowercase、alpha、alphaDigit分别对应序列类型为
// 数字、大写字母、小写字母、任意字母、字母数字序列
randSymbol = function(n, t) {
  var lower = 'abcdefghijklmnopqrstuvwxyz';
  var upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var digit = '1234567890';
  var source = {
    digit: digit,
    uppercase: upper,
    lowercase: lower,
    alpha: upper + lower,
    alphaDigit: digit + upper + lower
  };
  var v = '';
  var s = source[t] || '';
  var len = s.length;
  var r;
  for (var i = 0; i < n; i++) {
    r = Math.floor(Math.random() * len);
    v += s[r];
  }
  return v;
};

