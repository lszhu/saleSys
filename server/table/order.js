Meteor.methods({
  orderTable: function (options) {
    check(options, {
      stationId: String,
      type: String,
      status: String,
      start: String,
      deadline: String,
      filterKey: String
    });
    var start = new Date(options.start);
    if (start == 'Invalid Date') {
      start = yearAgo();
    }
    var deadline = parseDeadline(options.deadline);
    // 时间的限制为订单处理发生的时间而不是订单建立的时间
    var disposalQuery = {
      orderId: {$ne: ''},
      type: {$nin: ['员工借贷', '货币兑换']},
      timestamp: {$gt: start, $lt: deadline}
    };
    var query = {};
    if (options.stationId) {
      query.stationId = options.stationId;
      disposalQuery.stationId = options.stationId;
    }
    if (options.type) {
      query.type = options.type;
    }
    if (options.status) {
      query.status = options.status;
    }
    if (options.filterKey) {
      query.comment = new RegExp(options.filterKey, 'i');
    }
    var orders = Orders.find(query).fetch();
    //console.log('orders: ' + JSON.stringify(orders));
    var capital = Capitals.find(disposalQuery).fetch();
    var data = objToArray(convergeAll(capital), orders);
    //data.push([]);
    return data;
  }
});

function convergeAll(capital) {
  if (!capital || capital.constructor.name != 'Array' || !capital.length) {
    return {};
  }
  // 以订单Id为索引属性保存各个订单的汇总信息
  // 每个订单的信息为[采购支出，其它支出，收入]
  var sum = {};
  var orderId, money, type, val;
  var len = capital.length;
  for (var i = 0; i < len; i++) {
    orderId = capital[i].orderId;
    money = capital[i].money;
    type = capital[i].type;
    if (!sum.hasOwnProperty(orderId)) {
      sum[orderId] = {};
    }
    val = sum[orderId];
    if (!val.hasOwnProperty(money.currency)) {
      sum[orderId][money.currency] = [0, 0, 0];
    }
    val = sum[orderId][money.currency];
    if (type == '采购') {
      val[0] -= money.value;
    } else if (type == '销售') {
      val[2] += money.value;
    } else {
      val[1] -= money.value;
    }
  }
  return sum;
}

// 将以对象形式保存的汇总数据改为数组形式
function objToArray(sum, orders) {
  if (!sum) {
    return [];
  }
  // 将stations由数组转为以_id值为索引属性的对象
  var order = indexOrders(orders);
  //console.log('station: ' + JSON.stringify(order));
  var i, j, tmp, inOrder;
  var data = [];
  for (i in sum) {
    if (!sum.hasOwnProperty(i)) {
      continue;
    }
    // 订单不满足过滤条件的情况
    if (!order.hasOwnProperty(i)) {
      continue;
    }
    inOrder = sum[i];
    for (j in inOrder) {
      if (!inOrder.hasOwnProperty(j)) {
        continue;
      }
      tmp = inOrder[j];
      tmp[3] = tmp[2] - tmp[1] - tmp[0];
      tmp[4] = tmp[3] / (tmp[1] + tmp[0]);
      if (isNaN(tmp[4]) || tmp[4] == Infinity) {
        tmp[4] = '';
      }
      tmp.unshift(order[i].code, order[i].stationId, j);
      data.push(tmp);
    }
  }
  return data;
}

// 将订单基本信息转换为以订单_id为索引的对象，并将部门id转换为名称
function indexOrders(orders) {
  if (!orders || orders.constructor.name != 'Array' || !orders.length) {
    return {};
  }
  var stations = Stations.find().fetch();
  stations = _.indexBy(stations, '_id');
  for (var i = 0, len = orders.length; i < len; i++) {
    orders[i].stationId = stations[orders[i].stationId]['name'];
  }
  return _.indexBy(orders, '_id');
}

