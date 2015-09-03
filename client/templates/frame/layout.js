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
  // 检查是否含有会话cookie且值为loggedIn，如果正确设定了，则表示之前已正常登录
  if (document.cookie != 'loggedIn') {
    console.log('loginStatus: ' + document.cookie);
    Meteor.logout();
    return;
  }

  Meteor.call('getUserInfo', function (err, result) {
    if (err) {
      throwError('无法获取用户信息');
    } else {
      // 保存到Session中，用于其他地方的使用
      Session.set('receiverList', _.indexBy(result, '_id'));
    }
  });
});