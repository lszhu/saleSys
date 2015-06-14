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

    customer = _.extend(customer, {timestamp: new Date()});
    var errors = validateCustomer(data);
    if (errors.err) {
      throw new Meteor.Error('invalid-customer', getErrorMessage(errors));
    }
    // 更新条目情况的处理
    if (data.overlap) {
      Customers.update(data.overlap, customer);
    } else {
      // 新增customer条目
      return Customers.insert(customer);
    }

    //if (!customer.code || !customer.name || !customer.phone) {
    //  throw new Meteor.Error('invalid-customer', '录入信息不完整');
    //}

    // 创建新customer时，客户编号不能重复
    //var exist = Customers.findOne({code: customer.code});
    //if (exist) {
    //  throw new Meteor.Error('exist_customer', '客户编号重复');
    //}

  },

  customerRemove: function (objectId) {
    check(objectId, String);
    Customers.remove(objectId);
  }
});

validateCustomer = function (post) {
  var errors = {};
  var customer = post.customer;
  //console.log('account: ' + JSON.stringify(account));

  if (!customer.code) {
    errors.code = '客户编号不能为空';
    errors.err = true;
  }
  if (!customer.name) {
    errors.name = '客户名称不能为空';
    errors.err = true;
  }
  if (!customer.phone && !customer.email) {
    errors.phone = '未提供电话等任何联系方式';
    errors.email = '未提供邮箱等任何联系方式';
    errors.err = true;
  }
  if (!post.overlap) {
    if (Customers.findOne({code: customer.code})) {
      errors.code = '已经存在相同的编号';
      errors.err = true;
    }
    if (Customers.findOne({phone: customer.phone, email: customer.email})) {
      errors.contact = '已经存在联系方式完全相同的客户';
      errors.err = true;
    }
  }

  return errors;
};
