Orders = new Mongo.Collection('orders');

Meteor.methods({
  orderInsert: function (order) {
    //console.log('data: ' + JSON.stringify(data));
    check(order, {
      code: String,
      type: String,
      status: String,
      customer: String,
      phone: String,
      address: String,
      deadline: String,
      stationId: String,
      managerId: String,
      comment: String,
      disposal: Object
    });

    //var user = Meteor.user();
    //var post = Posts.findOne(orderAttributes.postId);

    var errors = validateOrderBase(order);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    //order = _.extend(order, {
    //  timestamp: new Date(),
    //  creatorId: Meteor.userId(),
      // 状态分为：进行，完成，终止三种，初始为进行状态
      //status: '进行'
    //});

    // 创建新order时，编号不能重复
    var exist = Orders.findOne({code: order.code});
    if (exist) {
      throw new Meteor.Error('exist_order', '订单编号重复');
    }

    // 新增order条目
    order._id = Orders.insert(order);

    return order._id;
  },

  orderUpdate: function(objectId, order) {
    check(objectId, String);
    check(order, {
      code: String,
      type: String,
      status: String,
      customer: String,
      phone: String,
      address: String,
      deadline: String,
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
    var disposal = order.disposal;
    order = _.omit(order, 'disposal');
    // 更新基本订单信息
    Orders.update(objectId, {$set: order});
    // 更新订单处理信息
    if (disposal.index >= 0) {
      // 修改订单处理信息
      var item = {};
      item['disposal.' + disposal.index] = disposal;
      Orders.update(objectId, {$set: item});
    } else if (disposal.index == -1) {
      // 添加新订单处理到处理列表的末尾
      Orders.update(objectId, {$push: {disposal: disposal}});
    }
  },

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

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
  // 只有订单类型为销售时，客户id是必须的
  if (order.type == '销售' && !order.customer) {
    errors.customer = '未选择特定客户';
    errors.err = true;
    if (!order.phone) {
      errors.phone = '电话未填写';
      errors.err = true;
    }
  }
  return errors;
};
