Orders = new Mongo.Collection('orders');

Meteor.methods({
  orderInsert: function (order) {
    check(order, {
      code: String,
      type: String,
      status: String,
      customer: String,
      phone: String,
      address: String,
      deadline: Number,
      stationId: String,
      managerId: String,
      comment: String,
      disposal: Object
    });

    var errors = validateOrderBase(order);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    // 将order的disposal改为空数组以保持与设计的一致
    order.disposal = [];

    // 特别处理订单截止日期
    if (!order.deadline) {
      order = _.omit(order, 'deadline');
    } else {
      // 将截止日期有数字改为日期Date格式
      order.deadline = new Date(order.deadline);
    }

    // 创建新order时，编号不能重复
    var exist = Orders.findOne({code: order.code});
    if (exist) {
      throw new Meteor.Error('exist_order', '订单编号重复');
    }

    // 添加订单建立的时间戳
    order.timestamp = new Date();

    // 新增order条目
    order._id = Orders.insert(order);

    return order._id;
  },

  orderUpdate: function (objectId, order) {
    check(objectId, String);
    check(order, {
      code: String,
      type: String,
      status: String,
      customer: String,
      phone: String,
      address: String,
      deadline: Number,
      stationId: String,
      managerId: String,
      comment: String,
      disposal: Object
    });
    var errors = validateOrderBase(order);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    if (!objectId) {
      throw new Meteor.Error('invalid-order-Id', '未提供有效的订单Id');
    }

    // 特别处理订单截止日期
    if (!order.deadline) {
      order = _.omit(order, 'deadline');
    } else {
      // 将截止日期有数字改为日期Date格式
      order.deadline = new Date(order.deadline);
    }

    var disposal = order.disposal;
    var index = disposal && disposal.index;
    // 只有当disposal的index不小于-1时，才需要处理订单处理的内容
    if (index >= -1) {
      errors = validateOrderDisposal(disposal);
      if (errors.err) {
        throw new Meteor.Error('invalid-disposal', getErrorMessage(errors));
      }
    }

    order = _.omit(order, 'disposal');
    // 更新基本订单信息
    Orders.update(objectId, {$set: order});

    // 更新订单处理信息
    disposal = _.omit(disposal, 'index');
    // 确保index为整数
    index = parseInt(index);
    var customer = order.customer;
    if (!Customers.findOne(customer)) {
      customer = '';
    }
    saveDisposal(objectId, index, disposal, order.stationId, customer);
  },

  orderDisposalUpdate: function (data) {
    check(data, {
      orderId: String,
      index: Number,
      partnerId: String,
      stationId: String,
      capitalId: String,
      deliveryId: String,
      disposal: {
        managerId: String,
        type: String,
        comment: String,
        capital: Object,
        delivery: Object,
        timestamp: Number
      }
    });

    if (data.index < -1) {
      throw new Meteor.Error('invalid-index', '订单处理编号异常');
    }
    var disposal = data.disposal;
    var deliveryId;

    // 处理capital集合记录
    var capitalId = setCapital(data);

    // 处理delivery集合记录
    deliveryId = setDelivery(data);

    disposal.timestamp = new Date(disposal.timestamp);
    disposal = _.extend(disposal, {
      capitalId: capitalId,
      deliveryId: deliveryId
    });
    disposal = _.omit(disposal, 'disposal', 'delivery');
    console.log('disposal: ' + JSON.stringify(disposal));

    // 修改订单处理信息
    if (data.index == -1) {
      Orders.update(data.orderId, {$push: {disposal: disposal}});
    } else {
      var item = {};
      item['disposal.' + data.index] = disposal;
      Orders.update(data.orderId, {$set: item});
    }
  },

  orderDisposalRemove: function (orderId, index) {
    check(orderId, String);
    check(index, Number);
    // todo
    var order = Orders.findOne(orderId);
    var disposal = order && order.disposal;
    if (!disposal || disposal.length < index || index < 0) {
      throw new Meteor.Error('invalid-disposal-remove', '未指定合适的订单信息');
    }
    disposal.splice(index, 1);
    Orders.update(orderId, {$set: {disposal: disposal}});
  },

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

// 调用delivery集合操作函数插入、更新或删除条目
setDelivery= function (data) {
  var disposal = data.disposal;
  var deliveryId = data.deliveryId;

  if (!disposal.delivery.type) {
    if (deliveryId) {
      Meteor.call('deliveryRemove', deliveryId);
    }
    return '';
  }

  // 添加delivery集合记录
  disposal.delivery = _.extend(disposal.delivery, {
    stationId: data.stationId,
    operatorId: disposal.managerId,
    orderId: data.orderId
  });
  if (deliveryId) {
    Meteor.call('deliveryUpdate', deliveryId, disposal.delivery);
  } else {
    deliveryId = Meteor.call('deliveryInsert', disposal.delivery);
  }
  return deliveryId;
};

// 调用delivery集合操作函数插入、更新或删除条目
setCapital = function (data) {
  var disposal = data.disposal;
  var capitalId = data.capitalId;
  capitalId = capitalId ? capitalId : '';

  if (!disposal.capital.type) {
    if (capitalId) {
      Meteor.call('capitalRemove', capitalId);
    }
    return '';
  }

  // 更新或添加capital集合记录
  disposal.capital = _.extend(disposal.capital, {
    stationId: data.stationId,
    operatorId: disposal.managerId,
    partnerId: data.partnerId,
    orderId: data.orderId
  });
  if (capitalId) {
    Meteor.call('capitalUpdate', capitalId, disposal.capital);
  } else {
    capitalId = Meteor.call('capitalInsert', disposal.capital);
  }
  return capitalId;
};

// 加入或更新订单处理内容
// orderId为对应订单的Id，index为订单处理数组索引，-1表示新增
// disposal为处理内容，stationId为部门Id
saveDisposal = function (orderId, index, disposal, stationId, partnerId) {
  // 特别处理订单日期由数字转换Date类型
  disposal.timestamp = new Date(disposal.timestamp);

  var delivery, capital;
  var common = {
    stationId: stationId,
    operatorId: disposal.managerId,
    orderId: orderId,
    timestamp: new Date()
  };
  if (index >= 0) {
    // 更新已有订单处理
    var order = Orders.findOne(orderId);
    if (order && order.disposal && order.disposal[index]) {
      disposal.deliveryId = order.disposal[index].deliveryId;
      // todo
    }
    if (disposal.delivery.type) {
      delivery = _.extend(disposal.delivery, common);
      Deliveries.update(deliveryId, delivery);
    }
    if (disposal.capital.type) {
      capital = _.extend(disposal.capital, common, {partnerId: partnerId});
      Capitals.update(capitalId, capital);
    }
    disposal = _.omit(disposal, 'delivery', 'capital');
    // 修改订单处理信息
    var item = {};
    item['disposal.' + index] = disposal;
    Orders.update(orderId, {$set: item});
  } else if (index == -1) {
    // 添加新的订单处理
    delivery = _.extend(disposal.delivery, common);
    disposal.deliveryId = Deliveries.insert(delivery);
    capital = _.extend(disposal.capital, common, {partnerId: partnerId});
    disposal.capitalId = Capitals.insert(capital);
    disposal = _.omit(disposal, 'delivery', 'capital');
    // 添加新订单处理到处理列表的末尾
    Orders.update(orderId, {$push: {disposal: disposal}});
  }
};

validateOrderBase = function (order) {
  var errors = {};

  if (!order.code) {
    errors.code = '编号未填写';
    errors.err = true;
  }
  if (!order.type) {
    errors.type = '未选择订单类型';
    errors.err = true;
  }
  if (order.status != '进行' && order.status != '完成' &&
      order.status != '终止') {
    errors.status = '订单状态指定错误';
    errors.err = true;
  }
  var d = new Date(order.deadline);
  if (d.toString == 'Invalid Date') {
    errors.deadline = '交货截止日期设定错误';
    errors.err = true;
  }
  if (!Stations.findOne(order.stationId)) {
    errors.stationId = '部门指定错误';
    errors.err = true;
  }
  // 在服务器端验证订单主管Id
  // 因为账号信息未发布的原因，该验证无法在客户端完成普通账号的验证
  if (Meteor.isServer && !Meteor.users.findOne(order.managerId)) {
    errors.managerId = '订单主管人员指定错误';
    errors.err = true;
  }
  // 只有订单类型为销售时，客户信息和电话是必须的
  if (order.type == '销售' && !order.customer) {
    errors.customer = '未填写或选择特定客户';
    errors.err = true;
    if (!order.phone) {
      errors.phone = '未填写电话';
      errors.err = true;
    }
  }
  return errors;
};

validateOrderDisposal = function (disposal) {
  var errors = {};

  if (!disposal) {
    return {index: '未提供订单处理信息', err: true};
  }
  if (disposal.index != -1 && disposal < 0) {
    errors.index = '非法的订单处理操作';
  }
  if (!disposal.timestamp || disposal.timestamp < 0) {
    console.log('timestamp: ' + disposal.timestamp);
    errors.timestamp = '订单处理日期填写错误';
  }
  if (!disposal.type) {
    errors.type = '未指定订单处理类型';
  }
  if (!disposal.managerId) {
    errors.managerId = '未指定本次订单处理的主管人员';
  }
  var delivery = disposal.delivery;
  if (delivery) {
    if (!delivery.type && (delivery.comment || delivery.product)) {
      errors.goodsType = '必须指定货物操作类型';
    }
  }
  var capital = disposal.capital;
  if (capital) {
    var money = capital.money || {};
    if (!capital.type && money.type) {
      errors.capitalType = '必须同时指定资金类型';
    } else if (capital.type && !money.type) {
      errors.accountType = '必须同时指定资金操作方式';
    }

    if (money.value && !money.type) {
      errors.accountType = '必须同时指定资金操作方式';
    } else if (money.value && !money.currency) {
      errors.currency = '必须指定货币类型';
    }
  }
  if (Object.keys(errors).length) {
    errors.err = true;
  }
  return errors;
};
