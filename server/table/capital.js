Meteor.methods({
  capitalTable: function (options) {
    check(options, {
      start: String,
      deadline: String,
      stationId: String
    });
    var start = new Date(options.start);
    if (start == 'Invalid Date') {
      start = yearAgo();
    }
    var deadline = parseDeadline(options.deadline);
    var query = {timestamp: {$gt: start, $lt: deadline}};
    if (options.stationId) {
      query.stationId = options.stationId;
    }
    //console.log('query: ' + JSON.stringify(query));
    var capital = Capitals.find(query).fetch();
    //console.log('capital: ' + JSON.stringify(capital));
    //var data = convergence(capital);
    //console.log('storeTable data: ' + JSON.stringify(data));
    return convergence(capital);
  }
});

function convergence(data) {
  if (!data || data.constructor.name != 'Array') {
    return [];
  }
  // 保存产品汇总信息，已对应产品编号为索引
  // 每项格式为['类型', '币种', '支出', '收入', '净收入', '收益率']
  var converged = {};

  var money, type, tmp, i, j, len, sum;
  for (i = 0, len = data.length; i < len; i++) {
    money = data[i].money;
    type = data[i].type;
    if (!money || !type) {
      continue;
    }
    // 如果不存在对应类型，则先初始化
    if (!converged.hasOwnProperty(type)) {
      converged[type] = {}; //[data.type, 0, 0, 0, 0];
    }
    tmp = converged[type];
    // 如果不存在对应货币类型，则先初始化
    if (!tmp.hasOwnProperty(money.currency)) {
      // 格式为[支出, 收入]
      tmp[money.currency] = [0, 0];
    }
    sum = tmp[money.currency];
    if (money.value < 0) {
      sum[0] -= money.value;
    } else {
      sum[1] += money.value;
    }
  }
  //console.log('converged data: ' + JSON.stringify(converged));
  // 将converged由对象转换为数组，并插入索引属性（产品编号）到数组第一个元素
  var result = [];
  for (i in converged) {
    if (!converged.hasOwnProperty(i)) {
      continue;
    }
    tmp = converged[i];
    for (j in tmp) {
      if (!tmp.hasOwnProperty(j)) {
        continue;
      }
      sum = tmp[j];
      sum[2] = sum[1] - sum[0];
      sum.unshift(i, j);
      result.push(sum);
    }
  }
  return result;
}
