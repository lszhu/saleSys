Messages = new Mongo.Collection('messages');

Meteor.methods({
  messageInsert: function(message) {
    check(message, {
      type: String,
      priority: String,
      receiverId: String,
      headline: String,
      content: String,
      manual: Boolean
    });

    var errors = validateMessage(message);
    if (errors.err) {
      throw new Meteor.Error('invalid-message', getErrorMessage(errors));
    }
    message.timestamp = new Date();
    message = _.extend(message, {
      timestamp: new Date(),
      creatorId: Meteor.userId(),
      read: false
    });
    return Messages.insert(message);
  },

  messageRemove: function(objectId) {
    check(objectId, String);
    // 不是管理员用户不可以删除信息
    if (!isAdministrator()) {
      throw new Meteor.Error('invalid-user', '你无权删除任何消息');
    }
    Messages.remove(objectId);
  }
});

validateMessage = function(message) {
  var errors = {};

  if (!message) {
    errors.message = '不允许发送空消息';
  }
  if (!message.type) {
    errors.type = '未指定消息类型';
  }
  if (!message.receiverId) {
    errors.receiverId = '未制定消息的接收者';
  }
  if (!message.headline && !message.content) {
    errors.headline = '标题和内容都未填写';
    errors.content = '需至少填写一项';
  }
  if (Object.keys(errors).length) {
    errors.err = true;
  }
  return errors;
};