Orders = new Mongo.Collection('orders');

Meteor.methods({
  orderInsert: function (order) {
    //console.log('data: ' + JSON.stringify(data));
    check(order, {
        code: String,
        type: String,
        stationId: String,
        customer: String,
        phone: String,
        address: String,
        comment: String
    });

    //var user = Meteor.user();
    //var post = Posts.findOne(orderAttributes.postId);

    var errors = validateNewOrder(order);
    if (errors.err) {
      throw new Meteor.Error('invalid-order', getErrorMessage(errors));
    }

    order = _.extend(order, {
      timestamp: new Date(),
      creatorId: Meteor.userId(),
      // 状态分为：进行，完成，终止三种，初始为进行状态
      status: '进行'
    });

    // 创建新order时，编号不能重复
    var exist = Orders.findOne({code: order.code});
    if (exist) {
      throw new Meteor.Error('exist_order', '订单编号重复');
    }

    // 新增order条目
    order._id = Orders.insert(order);

    return order._id;
  },

  orderRemove: function (objectId) {
    check(objectId, String);
    Orders.remove(objectId);
  }
});

validateNewOrder = function (order) {
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
    errors.customer= '未选择特定客户';
    errors.err = true;
    if (!order.phone) {
      errors.phone = '电话未填写';
      errors.err = true;
    }
  }
  return errors;
};
