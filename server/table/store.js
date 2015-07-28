Meteor.methods({
  storeTable: function (options) {
    check(options, {
      deadline: String,
      stationId: String,
      filterKey: String
    });
    var deadline = parseDeadline(options.deadline);
    var query = {timestamp: {$lt: deadline}};
    if (options.stationId) {
      query.stationId = options.stationId;
    }
    var delivery = Deliveries.find(query).fetch();
    //console.log('delivery: ' + JSON.stringify(delivery));
    var data = convergence(delivery);
    //console.log('storeTable data: ' + JSON.stringify(data));
    // 过滤出产品编号或名称包含关键字的项目
    if (options.filterKey) {
      var re = new RegExp(options.filterKey, 'i');
      data = data.filter(function (e) {
        return re.test(e[0]) || re.test(e[1]);
      });
    }
    data.push([]);
    return data;
  }
});

function convergence(data) {
  if (!data || data.constructor.name != 'Array') {
    return [];
  }
  // 保存无产品编号的汇总数据
  var empty = [0, {}, 0, {}];
  // 保存产品汇总信息，已对应产品编号为索引
  var converged = {};

  var product, tmp, i, j, len;
  for (i = 0, len = data.length; i < len; i++) {
    product = data[i].product;
    if (!product || product.constructor.name != 'Array' || !product.length) {
      continue;
    }
    //console.log('product: ' + JSON.stringify(product));
    addUpDelivery(empty, converged, product, data[i].type);
  }
  //console.log('converged data: ' + JSON.stringify(converged));
  // 将converged由对象转换为数组，并插入索引属性（产品编号）到数组第一个元素
  var result = [];
  for (j in converged) {
    if (!converged.hasOwnProperty(j)) {
      continue;
    }
    tmp = converged[j];
    tmp[3] = concatCurrency(tmp[3]);
    tmp[5] = concatCurrency(tmp[5]);
    tmp[6] = tmp[2] - tmp[4];
    tmp[0] = j;
    result.push(tmp);
  }
  //console.log('empty: ' + JSON.stringify(empty));
  if (empty[0] || empty[2]) {
    empty[1] = concatCurrency(empty[1]);
    empty[3] = concatCurrency(empty[3]);
    empty[6] = empty[2] - empty[4];
    empty.unshift('');
    empty.unshift('无编号');
    result.push(empty);
  }
  return result;
}

// 根据出库还是入库分别累加产品数量和资金，并保存到empty或converged
function addUpDelivery(empty, converged, product, type) {
  if (!empty || !converged) {
    return;
  }
  var delta = 0;
  if (type == '出库') {
    //console.log('出库');
    delta = 2;
  } else if (type != '入库') {
    return;
  }
  var tmp, cur, sum;
  for (var j = 0, len = product.length; j < len; j++) {
    tmp = product[j];
    cur = tmp[5];
    if (!cur) {
      continue;
    }
    // 无产品编号的情况
    if (!tmp[0]) {
      empty[0 + delta] += parseFloat(tmp[2]) ? +tmp[2] : 0;
      if (!empty[1 + delta][cur]) {
        empty[1 + delta][cur] = 0;
      }
      empty[1 + delta][cur] += parseFloat(tmp[4]) ? +tmp[4] : 0;
      continue;
    }
    // 首次统计一个产品编号的产品时先要初始化
    if (!converged[tmp[0]]) {
      converged[tmp[0]] = ['', '', 0, {}, 0, {}];
    }
    sum = converged[tmp[0]];
    if (tmp[1]) {
      sum[1] = tmp[1];
    }
    sum[2 + delta] += parseFloat(tmp[2]) ? +tmp[2] : 0;
    if (!sum[3 + delta][cur]) {
      sum[3 + delta][cur] = 0;
    }
    sum[3 + delta][cur] += parseFloat(tmp[4]) ? +tmp[4] : 0;
  }
  //console.log('converged: ' + JSON.stringify(converged));
}
// 将类似{CNY: 2352, USD: 5234}转换为'CNY2352.00, USD5234.00'
function concatCurrency(currency) {
  var result = [];
  for (var i in currency) {
    if (!currency.hasOwnProperty(i)) {
      continue;
    }
    result.push(i + toDecimal2(currency[i]));
  }
  return result.join(', ');
}

function parseDeadline(d) {
  if (!d || d.constructor.name != 'Array') {
    return new Date();
  }
  var t = t.split('-');
  // 将日期增加一天，以便包含当天
  t = new Date(t[0], t[1], t[2] + 1);
  return t == 'Invalid Date' ? new Date() : t;
}