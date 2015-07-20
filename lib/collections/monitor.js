Monitors = new Mongo.Collection('monitors');

Meteor.methods({
  addMonitor: function (monitor) {
    check(monitor, {senderId: String, receiverId: String});

    var errors = validateMonitor(monitor);
    if (errors.err) {
      throw new Meteor.Error('invalid-monitor', '无效的自动消息监控设置');
    }

    if (!isAdministrator()) {
      throw new Meteor.Error('invalid-user', '当前用户不具备该操作权利');
    }
    if (!Meteor.users.findOne(monitor.senderId)) {
      throw new Meteor.Error('invalid-sender', '无效的发送者用户');
    }
    if (!Meteor.users.findOne(monitor.receiverId)) {
      throw new Meteor.Error('invalid-receiver', '无效的接收者用户');
    }
    if (Monitors.findOne(monitor)) {
      throw new Meteor.Error('duplicate-monitor', '已存在该设置');
    }
    Monitors.insert(monitor);

    //Meteor.users.update(monitor.senderId,
    //    {$addToSet: {monitors: monitor.receiverId}});
  },

  removeMonitor: function (objectId) {
    check(objectId, String);
    if (!objectId) {
      throw new Meteor.Error('invalid-monitor', '无效的参数');
    }

    if (!isAdministrator()) {
      throw new Meteor.Error('invalid-user', '当前用户不具备该操作权利');
    }
    if (!Monitors.findOne(objectId)) {
      throw new Meteor.Error('invalid-sender', '不存在相应设置');
    }
    Monitors.remove(objectId);

    //Meteor.users.update(monitor.sender,
    //    {$pull: {monitors: monitor.receiverId}});
  }

});

function validateMonitor(monitor) {
  var errors = {};
  if (!monitor) {
    return {err: true, empty: '未提供有效设置内容'};
  }
  if (!monitor.receiverId) {
    errors.receiver = '未设置自动消息的接收者';
    errors.err = true;
  }
  if (!monitor.senderId) {
    errors.senderId = '未设置自动消息的发送者';
    errors.err = true;
  }
  return errors;
}
