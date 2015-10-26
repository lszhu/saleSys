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

Template.layout.onRendered(function() {
  console.log('layout rendered');
   // 检查是否含有会话cookie，如果正确设定了，则表示之前已正常登录
  if (document.cookie.search('loginStatus=In') == -1) {
    console.log('loginStatus: ' + document.cookie);
    // 将cookie设置为为登录状态
    document.cookie = 'loginStatus=Out';
    Meteor.logout();
  }
});
