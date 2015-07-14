Template.receiverSelection.helpers({
  receiverList: function () {
    var currentData = Template.currentData();
    return currentData ? currentData.getReceivers() : [];
    //return [
    //  {name: 'aaa', receivers: [
    //    {_id: 'tafsa', name: 'gssdf'}, {_id: 'asdf', name: 'juasdk'}
    //  ]},
    //  {name: 'bbb', receivers: [
    //    {_id: 'jas', name: 'h234'}, {_id: '2esd', name: 'sdfi23'}
    //  ]}
    //];
  }
});

Template.receiverSelection.onCreated(function () {
  // 必须保证当前模板上下文数据不是未定义
  var currentData = Template.currentData();
  currentData._receivers = [];
  currentData._receiversListeners = new Tracker.Dependency();
  currentData.getReceivers = function () {
    currentData._receiversListeners.depend();
    return currentData._receivers;
  };
  Meteor.call('getUserInfo', function (err, result) {
    if (err) {
      currentData._receivers = [];
      throwError('无法获取用户信息');
    } else {
      // 保存到Session中，用于其他地方的使用
      Session.set('receiverList', _.indexBy(result, '_id'));
      // 更新数据
      currentData._receivers = classifyReceivers(result);
    }
    currentData._receiversListeners.changed();
  });
});

Template.addMessage.helpers({
  hasError: function (field) {
    return !!Session.get('messageSubmitErrors')[field] ? 'has-error' : '';
  },

  types: function () {
    return [
      {name: ''}, {name: '备货'}, {name: '发货'}, {name: '收货'},
      {name: '换货'}, {name: '退货'}, {name: '收款'}, {name: '付款'},
      {name: '退款'}, {name: '维修'}, {name: '报废'}, {name: '其它'}
    ];
  }

});

Template.messageListItem.helpers({
  formatDate: formatDate,
  priorityName: function (p) {
    var name = ['最低', '普通', '较高', '最高'];
    return name[p];
  },
  source: function (s) {
    return s ? '手工' : '自动';
  },
  creator: getNameFromId,
  receiver: getNameFromId
});

Template.message.onCreated(function () {
  Session.set('messageSubmitErrors', {});
  Session.set('receiverList', []);
});

Template.message.onDestroyed(function () {
  Session.set('receiverList', null);
});

Template.message.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.message-keyword').val(key);
  var target = $('#add-message');
  //target.removeClass('hidden');
  target.hide();
});

Template.message.events({
  'keypress .message-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.message-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.message-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-message': function (e) {
    e.preventDefault();
    var keyword = $('.message-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-message': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('messageSubmitErrors', {});
    var target = $('#add-message');
    if (target.hasClass('hidden')) {
      target.removeClass('hidden');
      target.slideDown('fast');
    } else {
      target.slideUp('fast', function () {
        clearForm(target);
        target.addClass('hidden');
      });
    }
  },

  'click .remove-message': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('messageRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-message').find('[name=overlap]').val('');
  },

  'submit form.add-message': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var message = {
      type: form.find('[name=type]').val(),
      priority: form.find('[name=priority]').val(),
      receiverId: form.find('[name=receiver]').val(),
      headline: form.find('[name=headline]').val(),
      content: form.find('[name=content]').val()
    };
    console.log('message: ' + JSON.stringify(message));
    // 对输入信息进行校验
    var errors = validateMessage(message);
    console.log('errors in message submit: ' + JSON.stringify(errors));
    if (errors.err) {
      //console.log('errors: ' + JSON.stringify(errors));
      Session.set('messageSubmitErrors', errors);
      return throwError(getErrorMessage(errors));
    }
    // 手工创建的消息
    message.manual = true;
    Meteor.call('messageInsert', message, function (err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('messageSubmitErrors', {});
      // 如果是更新用户信息，则完成同时隐藏编辑表单
      var form = $('#add-message');
      // 清除表单的内容
      clearForm(form);
      form.slideUp('fast', function () {
        form.addClass('hidden');
      });
    });
  },

  'click .read-content': function(e) {
    e.preventDefault();

    var messageId = $(e.currentTarget).data('messageId');
    Meteor.call('setMessageRead', messageId, function(err) {
      if (err) {
        throwError(err.reason);
      }
    });
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=type]').val('');
  form.find('[name=priority]').val(2);
  form.find('[name=receiver]').val('');
  form.find('[name=headline]').val('');
  form.find('[name=content]').val('');
}

function getNameFromId(userId) {
  var receiverList = Session.get('receiverList');
  var user = receiverList[userId];
  return user && user.name;
}
