// 发布产品型号信息
Meteor.publish('products', function (filterKey, options) {
  check(filterKey, String);
  check(options, Object);
  var selector = {};
  if (filterKey) {
    var key = new RegExp(filterKey);
    selector = {
      $or: [{code: key}, {name: key}, {manager: key},
        {address: key}, {comment: key}, {memo: key}]
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
    var key = new RegExp(filterKey);
    selector = {
      $or: [{code: key}, {name: key}, {manager: key},
        {address: key}, {comment: key}, {memo: key}]
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
    var key = new RegExp(filterKey);
    selector = {
      $or: [{code: key}, {name: key}, {company: key}, {title: key},
        {phone: key}, {email: key}, {address: key}, {memo: key}]
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
    var key = new RegExp(filterKey);
    selector = {
      $or: [{code: key}, {name: key}, {manager: key},
        {address: key}, {comment: key}, {memo: key}]
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
