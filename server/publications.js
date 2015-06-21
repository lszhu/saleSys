// 发布订单信息
Meteor.publish('orders', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);

  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从客户名单集合中找到名称匹配关键字的客户的_id
    var customer = Customers.find({name: key}).fetch();
    customer = customer.map(function(e) {
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
  if (!user || user.grade != '3') {
    // 不是系统管理员账号，则只发布当前登录用户的信息
    return Meteor.users.find(this.userId);
  }

  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey, 'i');
    // 从销售分部collection中找到名称匹配关键字的销售分部对应_id
    var station = Stations.find({name: key}).fetch();
    //console.log('accounts publish, station: ' + JSON.stringify(station));
    station = station.map(function (e) {
      return e._id;
    });
    selector = {
      $or: [
        {_id: this.userId}, {username: key},
        {nickname: key}, {emails: {$elemMatch: {address: key}}},
        {stationId: {$in: station}}, {comment: key}
      ]
    };
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
