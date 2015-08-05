Meteor.methods({
  paymentTable: function (options) {
    check(options, {
      stationId: String,
      type: String,
      filterKey: String
    });
    var deliveryQuery = {
      orderId: {$ne: ''},
      type: {$in: ['出库', '入库']}
    };
    var capitalQuery = {
      orderId: {$ne: ''},
      type: {$in: ['销售', '采购']}
    };
    // 订单状态必须为'进行'
    var query = {status: '进行'};
    if (options.stationId) {
      query.stationId = options.stationId;
      deliveryQuery.stationId = options.stationId;
      capitalQuery.stationId = options.stationId;
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
    console.log('orders length: ' + JSON.stringify(orders.length));
    var delivery = Deliveries.find(deliveryQuery).fetch();
    var capital = Capitals.find(capitalQuery).fetch();
    console.log('capitals length: ' + JSON.stringify(capital.length));
    var data1 = convergeDelivery(delivery);
    console.log('converge delivery: ' + JSON.stringify(data1));
    var data2 = convergeCapital(capital);
    console.log('converge capital: ' + JSON.stringify(data2));
    var data = convergeAll(data1, data2, orders);
    console.log('result: ' + JSON.stringify(data));
    //data.push([]);
    return data;
  }
});

function convergeAll(deliverySum, capitalSum, orders) {
  // 参数至少有一个为空时
  if (!(deliverySum && capitalSum)) {
    return deliverySum || capitalSum;
  }

  var data = [];
  var type, tmp, merged;
  var order = indexOrders(orders);
  for (var i in deliverySum) {
    if (!deliverySum.hasOwnProperty(i)) {
      continue;
    }
    if (!order.hasOwnProperty(i)) {
      continue;
    }
    type = order[i].type;
    tmp = deliverySum[i];
    for (var j in tmp) {
      if (!tmp.hasOwnProperty(j)) {
        continue;
      }
      if (type == '采购') {
        merged = [order[i].code, order[i].stationId, j, tmp[j][0], null, 0];
        if (capitalSum[i] && capitalSum[i][j]) {
          merged[5] = capitalSum[i][j][0];
        }
        merged[6] = merged[3] - merged[5];
        if (merged[6] < 0) {
          merged[6] = 0;
        }
        if (Math.abs(merged[3]) > 0) {
          merged[7] = merged[5] / merged[3];
        }
      } else if (type == '销售') {
        merged = [order[i].code, order[i].stationId, j, null, tmp[j][1], 0];
        if (capitalSum[i] && capitalSum[i][j]) {
          merged[5] = capitalSum[i][j][2];
        }
        merged[6] = merged[4] - merged[5];
        if (merged[6] < 0) {
          merged[6] = 0;
        }
        if (Math.abs(merged[4]) > 0) {
          merged[7] = merged[5] / merged[4];
        }
      } else {
        continue;
      }
      data.push(merged);
    }
  }
  return data;
}

function convergeDelivery(delivery) {
  if (!delivery || delivery.constructor.name != 'Array' || !delivery.length) {
    return {};
  }

  // 以订单Id为索引属性保存各个订单的汇总信息
  // 每个订单的信息为[采购价，销售价]
  var sum = {};
  var i, j, len1, len2, type, product, id, data;
  for (i = 0, len1 = delivery.length; i < len1; i++) {
    product = delivery[i].product;
    if (!product || product.constructor.name != 'Array' || !product.length) {
      continue;
    }
    type = delivery[i].type;
    id = delivery[i].orderId;
    if (!sum.hasOwnProperty(id)) {
      sum[id] = {};
    }
    data = sum[id];
    for (j = 0, len2 = product.length; j < len2; j++) {
      // 获取货币种类信息
      id = product[j][5];
      // 如果未指定货币类型，默认为人民币CNY
      id = id ? id : 'CNY';
      if (!data.hasOwnProperty(id)) {
        data[id] = [0, 0];
      }
      if (type == '入库') {
        data[id][0] += product[j][4];
      } else if (type == '出库') {
        data[id][1] += product[j][4];
      }
    }
  }
  return sum;
}

function convergeCapital(capital) {
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
    if (!money) {
      continue;
    }
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

