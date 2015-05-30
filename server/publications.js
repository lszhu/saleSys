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
