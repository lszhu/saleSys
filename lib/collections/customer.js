Customers = new Mongo.Collection('customers');

Meteor.methods({
  customerInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      customer: {
        code: String,
        name: String,
        company: String,
        title: String,
        phone: String,
        email: String,
        address: String,
        memo: String
      },
      overlap: String
    });

    var customer = data.customer;
    //var user = Meteor.user();
    //var post = Posts.findOne(customerAttributes.postId);

    if (!customer.code || !customer.name || !customer.phone) {
      throw new Meteor.Error('invalid-customer', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      customer = _.extend(customer, {timestamp: new Date()});
      Customers.update(data.overlap, customer);
      return;
    }

    // 创建新customer时，客户编号不能重复
    var exist = Customers.findOne({code: customer.name});
    if (exist) {
      throw new Meteor.Error('exist_customer', '客户编号重复');
    }

    customer = _.extend(customer, {timestamp: new Date()});

    // 新增customer条目
    customer._id = Customers.insert(customer);
    //customer._id = Customers.upsert({name: customer.name}, customer);

    return customer._id;
  },

  customerRemove: function (objectId) {
    check(objectId, String);
    Customers.remove(objectId);
  }
});
