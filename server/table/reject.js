Meteor.methods({
  rejectTable: function (options) {
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
  // [编号, 名称, 出货数量, 换货数量, 不良率, 报废数量, 报废率]
  var empty = ['无编号', '', 0, 0, 0, 0, 0];
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
    tmp[6] = tmp[5] / tmp[2];
    tmp[4] = tmp[3] / tmp[2];
    tmp[0] = j;
    result.push(tmp);
  }
  //console.log('empty: ' + JSON.stringify(empty));
  if (empty[2] > 0 && (empty[3] || empty[5])) {
    empty[6] = empty[5] / empty[2];
    empty[4] = empty[3] / empty[2];
    result.push(empty);
  }
  return result;
}

// 根据出库还是入库分别累加产品数量和资金，并保存到empty或converged
function addUpDelivery(empty, converged, product, type) {
  if (!empty || !converged || !product ||
      product.constructor.name != 'Array' || !product.length) {
    return;
  }

  var tmp, sum, delta;
  var len = product.length;

  if (type == '出库') {
    delta = 0;
  } else if (type == '换货') {
    delta = 1;
  } else if (type == '报废') {
    delta = 3;
  } else {
    return;
  }

  for (var j = 0; j < len; j++) {
    tmp = product[j];
    // 无产品编号的情况
    if (!tmp[0]) {
      empty[2 + delta] += parseFloat(tmp[2]) ? +tmp[2] : 0;
    }
    // 首次统计一个产品编号的产品时先要初始化
    if (!converged[tmp[0]]) {
      converged[tmp[0]] = ['', '', 0, 0, 0, 0, 0];
    }
    sum = converged[tmp[0]];
    if (tmp[1]) {
      sum[1] = tmp[1];
    }
    sum[2 + delta] += parseFloat(tmp[2]) ? +tmp[2] : 0;
  }
  //console.log('converged: ' + JSON.stringify(converged));
}
