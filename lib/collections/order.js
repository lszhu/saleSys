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

    if (!objectId) {
      throw new Meteor.Error('invalid-order-Id', '未提供有效的订单Id');
    }

    var errors = validateOrderBase(order);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    // 特别处理订单截止日期
    if (!order.deadline) {
      order = _.omit(order, 'deadline');
    } else {
      // 将截止日期有数字改为日期Date格式
      order.deadline = new Date(order.deadline);
    }

    var disposal = order.disposal;
    order = _.omit(order, 'disposal');
    // 更新基本订单信息
    Orders.update(objectId, {$set: order});

    if (!disposal || !disposal.hasOwnProperty('index')) {
      return;
    }

    // 确保index为整数
    var index = parseInt(disposal.index);
    if (isNaN(index)) {
      throw new Meteor.Error('invalid-index', '错误的订单处理索引号');
    }
    // 只有当disposal的index不小于-1时，才有订单处理的内容需要处理
    if (index >= -1) {
      errors = validateOrderDisposal(disposal);
      if (errors.err) {
        throw new Meteor.Error('invalid-disposal', getErrorMessage(errors));
      }
    }

    // 暂时不支持在更新订单基本信息的同时更新已有订单处理记录
    if (index >= 0) {
      throw new Meteor.Error('invalid-index', '错误的订单处理索引号');
    }
    // 更新订单处理信息
    disposal = _.omit(disposal, 'index');
    disposal = _.extend(disposal, {deliveryId: '', capitalId: ''});
    var customer = order.customer;
    var common = {
      stationId: order.stationId,
      operatorId: disposal.managerId,
      orderId: objectId
    };
    // 添加新的订单处理
    var delivery = _.extend(disposal.delivery, common);
    //disposal.deliveryId = Deliveries.insert(delivery);
    if (delivery.type) {
      disposal.deliveryId = Meteor.call('deliveryInsert', delivery);
    }
    var capital = _.extend(disposal.capital, common, {partnerId: customer});
    //disposal.capitalId = Capitals.insert(capital);
    if (capital.type) {
      disposal.capitalId = Meteor.call('capitalInsert', capital);
    }
    console.log('message recorder: ' +
        JSON.stringify(autoMessageFromDisposal(objectId, disposal)));
    disposal = _.omit(disposal, 'delivery', 'capital');
    // 特别处理订单日期由数字转换Date类型
    disposal.timestamp = new Date(disposal.timestamp);
    // 添加新订单处理到处理列表的末尾
    Orders.update(objectId, {$push: {disposal: disposal}});

    // 更新订单后，根据自动消息设置创建通知
    sendNotes(objectId, disposal);
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

    var index = parseInt(data.index);
    if (isNaN(index) || index < -1) {
      throw new Meteor.Error('invalid-index', '订单处理编号异常');
    }
    var disposal = data.disposal;
    var errors = validateOrderDisposal(disposal);
    if (errors.err) {
      throw new Meteor.Error('invalid-order-disposal', getErrorMessage(errors));
    }

    // 处理capital集合记录
    var capitalId = setCapital(data);

    // 处理delivery集合记录
    var deliveryId = setDelivery(data);

    disposal.timestamp = new Date(disposal.timestamp);
    disposal = _.extend(disposal, {
      capitalId: capitalId,
      deliveryId: deliveryId
    });
    disposal = _.omit(disposal, 'disposal', 'delivery');
    console.log('disposal: ' + JSON.stringify(disposal));

    // 修改订单处理信息
    if (index == -1) {
      Orders.update(data.orderId, {$push: {disposal: disposal}});
      console.log('message recorder: ' +
          JSON.stringify(autoMessageFromDisposal(data.orderId, disposal)));
    } else {
      var item = {};
      item['disposal.' + index] = disposal;
      Orders.update(data.orderId, {$set: item});
      console.log('message recorder: ' +
          JSON.stringify(autoMessageFromDisposal(data.orderId, disposal)));
    }

    // 更新订单后，根据自动消息设置创建通知
    sendNotes(data.orderId, disposal);
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
    var removed = disposal.splice(index, 1);
    Orders.update(orderId, {$set: {disposal: disposal}});

    // 更新订单后，根据自动消息设置创建通知
    sendNotes(orderId, removed[0], '撤销处理：');
  },

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

// 调用delivery集合操作函数插入、更新或删除条目
setDelivery = function (data) {
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

  if (!disposal.capital.type || disposal.capital.money.value == 0) {
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
    errors.disposalType = '未指定订单处理类型';
  }
  if (!disposal.managerId) {
    errors.managerId = '未指定本次订单处理的主管人员';
  }
  var delivery = disposal.delivery;
  if (delivery) {
    if (!delivery.type && (delivery.comment ||
        delivery.product && delivery.product.length)) {
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
    if (!capital.type && capital.comment) {
      errors.capitalType = '必须同时指定资金类型';
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

// 更新订单后，根据自动消息设置创建通知
function sendNotes(orderId, disposal, prefix) {
  // 找到所有监控者（消息发送目标）
  var receivers = Monitors.find({senderId: Meteor.userId()}).fetch();
  console.log('receivers: ' + JSON.stringify(receivers));
  if (!receivers) {
    return;
  }

  var message = autoMessageFromDisposal(orderId, disposal);
  // 如果提供了prefix，则作为消息内容的前缀
  if (prefix) {
    message.content = prefix + message.content;
  }
  // 对每一个接收者发送一条消息（创建一条消息）
  receivers.forEach(function(e) {
    message.receiverId = e.receiverId;
    Meteor.call('messageInsert', message);
  });
}

