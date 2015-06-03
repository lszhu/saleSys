Users = Meteor.users;

Meteor.methods({
  userInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      user: {
        code: String,
        name: String,
        model: String,
        batch: String,
        price: {value: Number, currency: String},
        comment: String,
        memo: String
      },
      overlap: String
    });

    var user = data.user;
    //var user = Meteor.user();

    if (!user.code || !user.name || !user.model) {
      throw new Meteor.Error('invalid-user', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      user = _.extend(user, {timestamp: new Date()});
      Users.update(data.overlap, user);
      return;
    }

    // 创建新user时，不允许覆盖已有同型号且同批次的条目
    var exist = Users.findOne({model: user.model, batch: user.batch});
    if (exist) {
      throw new Meteor.Error('exist_user', '已有同型号且同批次的产品型号');
    }

    user = _.extend(user, {timestamp: new Date()});

    // 新增user条目
    user._id = Users.insert(user);
    //user._id = Users.upsert({name: user.name}, user);

    return user._id;
  },

  userRemove: function (objectId) {
    check(objectId, String);
    Users.remove(objectId);
  }
});
