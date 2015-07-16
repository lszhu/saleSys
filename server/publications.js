// 发布消息
Meteor.publish('messages', function (query, options) {
  check(query, Object);
  check(options, Object);

  var selector = {};
  //var userId = Meteor.userId();
  var userId = this.userId;
  // 如果不是管理员用户，则只发布当前用户发出或收到的消息
  var user = Meteor.users.findOne(userId);
  //console.log('当前用户级别：' + user && user.grade);
  if (user && user.grade != 3) {
    selector.$or = [{creatorId: userId}, {receiverId: userId}];
  }
  var filterKey = query.filterKey;
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    if (selector.$or) {
      selector.$and = [
        {$or: selector.$or},
        {$or: [{headline: key}, {content: key}]}
      ];
    } else {
      selector.$or = [{headline: key}, {content: key}];
    }
  }
  query = _.omit(query, 'filterKey');
  selector = _.extend(selector, query);
  console.log('message find selector: ' + JSON.stringify(selector));
  return Messages.find(selector, options);
});

// 发布特定订单关联的资金收支记录
Meteor.publish('capitalsByOrder', function (query, options) {
  check(query, {orderId: String});
  check(options, Object);

  return Capitals.find(query, options);
});

// 发布资金收支记录
Meteor.publish('capitals', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);

  var query = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从客户名单集合中找到名称匹配关键字的客户的_id
    var customer = Customers.find({name: key}).fetch();
    customer = customer.map(function (e) {
      return e._id;
    });
    // 从固定客户集合collections中找到名称匹配关键字的条目对应_id
    var employee = Employees.find({name: key}).fetch();
    //console.log('station: ' + JSON.stringify(station));
    employee = employee.map(function (e) {
      return e._id;
    });
    customer = customer.concat(employee);
    // 从员工集合employees中找出匹配关键字的条目对应_id
    query.$or = [
      {type: key}, {partnerId: key},
      {partnerId: {$in: customer}}, {comment: key}];
  }
  return Capitals.find(query, options);
});

// 发布特定订单关联的库存变更信息
Meteor.publish('deliveriesByOrder', function (query, options) {
  check(query, {orderId: String});
  check(options, Object);

  return Deliveries.find(query, options);
});

// 发布库存变更信息
Meteor.publish('deliveries', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);

  var query = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    /*
    // 从客户名单集合中找到名称匹配关键字的客户的_id
    var customer = Customers.find({name: key}).fetch();
    customer = customer.map(function (e) {
      return e._id;
    });
    // 从固定客户集合collections中找到名称匹配关键字的条目对应_id
    var employee = Employees.find({name: key}).fetch();
    //console.log('station: ' + JSON.stringify(station));
    employee = employee.map(function (e) {
      return e._id;
    });
    customer = customer.concat(employee);
    */
    // 从员工集合employees中找出匹配关键字的条目对应_id
    query.$or = [{type: key}, {comment: key}];
  }
  return Deliveries.find(query, options);
});

// 发布订单信息
Meteor.publish('orders', function (query, options) {
  // query可能包含filterKey和_id
  check(query, Object);
  check(options, Object);

  var selector = {};
  var _id = query._id;
  var filterKey = query.filterKey;
  if (_id) {
    selector = _id;
  } else if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从客户名单集合中找到名称匹配关键字的客户的_id
    var customer = Customers.find({name: key}).fetch();
    customer = customer.map(function (e) {
      return e._id;
    });
    // 从销售分部collection中找到名称匹配关键字的销售分部对应_id
    var station = Stations.find({name: key}).fetch();
    //console.log('station: ' + JSON.stringify(station));
    station = station.map(function (e) {
      return e._id;
    });
    selector = {
      $or: [
        {code: key}, {type: key}, {customerId: {$in: customer}},
        {phone: key}, {address: key}, {stationId: {$in: station}},
        {status: key}, {comment: key}
      ]
    };
  } else if (filterKey === undefined) {
    selector = '';
  }
  return Orders.find(selector, options);
});

// 发布账号信息
Meteor.publish('accounts', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);

  //console.log('account: ' + this.userId);
  // 验证用户是否已经登录
  if (!this.userId) {
    // 用户未登录
    return [];
  }
  var user = Meteor.users.findOne(this.userId);
  if (!user || user.grade <= 1) {
    // 不是系统管理员和特权用户账号，则只发布当前登录用户的信息
    return Meteor.users.find(this.userId);
  }

  var selector = {};
  // 如果是特权用户而不是系统管理员账号，需要限制在对应部门内
  if (user.grade == 2) {
    selector.stationId = user.stationId;
  }
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从销售分部collection中找到名称匹配关键字的销售分部对应_id
    var station = Stations.find({name: key}).fetch();
    //console.log('accounts publish, station: ' + JSON.stringify(station));
    station = station.map(function (e) {
      return e._id;
    });
    selector.$or = [
      {_id: this.userId}, {username: key},
      {nickname: key}, {emails: {$elemMatch: {address: key}}},
      {comment: key}, {stationId: {$in: station}}
    ];
  }
  //console.log('user count: ' + Meteor.users.find(selector, options).count());
  return Meteor.users.find(selector, options);
});

// 发布各国货币信息
Meteor.publish('currencies', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);
  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    selector = {
      $or: [
        {symbol: key}, {name: key}, {country: key},
        {rate: filterKey}, {memo: key}
      ]
    };
  }
  return Currencies.find(selector, options);
});

// 发布产品型号信息
Meteor.publish('products', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);
  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    selector = {
      $or: [
        {code: key}, {name: key}, {model: key}, {batch: key},
        {'price.value': parseFloat(filterKey)}, {'price.currency': key},
        {comment: key}, {memo: key}
      ]
    };
  }
  return Products.find(selector, options);
});

// 发布内部员工信息
Meteor.publish('employees', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);

  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从销售分部collection中找到名称匹配关键字的销售分部对应_id
    var station = Stations.find({name: key}).fetch();
    //console.log('station: ' + JSON.stringify(station));
    station = station.map(function (e) {
      return e._id;
    });
    selector = {
      $or: [
        {code: key}, {name: key}, {sex: key}, {title: key}, {phone: key},
        {email: key}, {'salary.value': parseFloat(filterKey)},
        {'salary.currency': key}, {stationId: {$in: station}}, {memo: key}
      ]
    };
  }
  return Employees.find(selector, options);
});

// 发布客户名单信息
Meteor.publish('customers', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);
  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    selector = {
      $or: [
        {code: key}, {name: key}, {company: key}, {title: key},
        {phone: key}, {email: key}, {address: key}, {memo: key}
      ]
    };
  }
  return Customers.find(selector, options);
});

// 发布销售分部信息
Meteor.publish('stations', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);
  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    selector = {
      $or: [
        {code: key}, {name: key}, {manager: key},
        {address: key}, {comment: key}, {memo: key}
      ]
    };
  }
  return Stations.find(selector, options);
});

///////////////////////////////////////////////////
// 一下内容共参考，正式版将删除

Meteor.publish('posts', function (options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Posts.find({}, options);
});

Meteor.publish('singlePost', function (id) {
  check(id, String);
  return Posts.find(id);
});


Meteor.publish('comments', function (postId) {
  check(postId, String);
  return Comments.find({postId: postId});
});

Meteor.publish('notifications', function () {
  return Notifications.find({userId: this.userId, read: false});
});
