Template.layout.onRendered(function () {
  this.find('#main')._uihooks = {
    insertElement: function (node, next) {
      $(node).hide().insertBefore(next).slideDown();
      //.fadeIn();
    },
    removeElement: function (node) {
      $(node).slideUp(function () {
        $(this).remove();
      });
    }
  }
});

Template.layout.onCreated(function () {
  Meteor.call('getUserInfo', function (err, result) {
    if (err) {
      throwError('无法获取用户信息');
    } else {
      // 保存到Session中，用于其他地方的使用
      Session.set('receiverList', _.indexBy(result, '_id'));
    }
  });
});