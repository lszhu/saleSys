Orders = new Mongo.Collection('orders');

Meteor.methods({
  orderInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      order: {
        code: String,
        name: String,
        sex: String,
        title: String,
        phone: String,
        email: String,
        stationId: String,
        salary: {
          value: Number,
          currency: String
        },
        memo: String
      },
      overlap: String
    });

    var order = data.order;
    //var user = Meteor.user();
    //var post = Posts.findOne(orderAttributes.postId);

    if (!order.code || !order.name || !order.phone) {
      throw new Meteor.Error('invalid-order', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      order = _.extend(order, {timestamp: new Date()});
      Orders.update(data.overlap, order);
      return;
    }

    // 创建新order时，员工编号不能重复
    var exist = Orders.findOne({code: order.code});
    if (exist) {
      throw new Meteor.Error('exist_order', '员工编号重复');
    }

    order = _.extend(order, {timestamp: new Date()});

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

validateOrder = function(data) {
  var errors = {};
  var order =  data.order;
  var overlap = data.overlap;

  if (!order.code) {
    errors.code = '编号未填写';
    errors.err = true;
  }
  if (!order.name) {
    errors.name = '姓名未填写';
    errors.err = true;
  }
  if (!order.phone) {
    errors.phone = '电话未填写';
    errors.err = true;
  }
  if (!order.salary.value) {
    errors.salary = '工资未正确填写';
    errors.err = true;
  }
  if (!order.salary.currency) {
    errors.currency = '货币类型未提供';
    errors.err = true;
  }
  if (errors.err) {
    return errors;
  }

  var e = Orders.findOne({code: order.code});
  if (e && e._id != overlap) {
    errors.code = '已存在该员工编号';
    errors.err = true;
  }
  e = Orders.findOne({name: order.name, phone: order.phone});
  if (e && e._id != overlap) {
    errors.name = '已存在该员工';
    errors.err = true;
  }
  return errors;
};