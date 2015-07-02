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

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

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

  if (disposal.index != -1 && disposal < 0) {
    errors.index = '非法的订单处理操作';
    errors.err = true;
  }
  if (!disposal.timestamp || disposal.timestamp < 0) {
    errors.timestamp = '订单处理日期填写错误';
    errors.err = true;
  }
  if (!disposal.type) {
    errors.type = '未指定订单处理类型';
    errors.err = true;
  }
  if (!disposal.managerId) {
    errors.managerId = '未指定本次订单处理的主管人员';
    errors.err = true;
  }


  return errors;
};
