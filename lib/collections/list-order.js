Orders = new Mongo.Collection('orders');

Meteor.methods({
  orderInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      order: {
        code: String,
        name: String,
        type: String,
        stationId: String,
        customerId: String,
        phone: String,
        comment: String
      },
      overlap: String
    });

    var order = data.order;
    //var user = Meteor.user();
    //var post = Posts.findOne(orderAttributes.postId);

    var errors = validateNewOrder(data);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    order = _.extend(order, {
      timestamp: new Date(),
      creatorId: Meteor.userId(),
      // 状态分为：进行，完成，终止三种，初始为进行状态
      status: '进行'
    });
    // 更新条目情况的处理
    if (data.overlap) {
      order = _.extend(order, {timestamp: new Date()});
      Orders.update(data.overlap, order);
      return;
    }

    // 创建新order时，编号不能重复
    var exist = Orders.findOne({code: order.code});
    if (exist) {
      throw new Meteor.Error('exist_order', '员工编号重复');
    }

    // 新增order条目
    order._id = Orders.insert(order);
    //order._id = Orders.upsert({name: order.name}, order);

    return order._id;
  },

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

validateNewOrder = function (data) {
  var errors = {};
  var order = data.order;
  //var overlap = data.overlap;

  if (!order.code) {
    errors.code = '编号未填写';
    errors.err = true;
  }
  if (!order.name) {
    errors.name = '名称未填写';
    errors.err = true;
  }
  if (!order.type) {
    errors.type = '未选择订单类型';
    errors.err = true;
  }
  // 只有订单类型为销售时，客户id是必须的
  if (order.type == '销售' && !order.customerId) {
    errors.customerId = '未选择特定客户';
    errors.err = true;
    if (!order.phone) {
      errors.phone = '电话未填写';
      errors.err = true;
    }
  }
  return errors;
};
