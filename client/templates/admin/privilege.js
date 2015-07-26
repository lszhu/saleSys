Template.privilege.helpers({
  hasError: function (field) {
    return !!Session.get('privilegeSubmitErrors')[field] ? 'has-error' : '';
  },
  senderUserList: function () {
    return privilegeTable.getSenderUserList();
  }
});

Template.privilege.onCreated(function () {
  Session.set('privilegeSubmitErrors', {});
  // 必须保证当前模板上下文数据不是未定义
  //var currentData = Template.currentData();
  //console.log('currentData: ' + currentData);
  privilegeTable = {};
  privilegeTable._senderUserList = [];
  privilegeTable._senderUserListListeners = new Tracker.Dependency();
  privilegeTable.getSenderUserList = function () {
    privilegeTable._senderUserListListeners.depend();
    return privilegeTable._senderUserList;
  };
  privilegeTable._receiverUserList = [];
  privilegeTable._receiverUserListListeners = new Tracker.Dependency();
  privilegeTable.getReceiverUserList = function () {
    privilegeTable._receiverUserListListeners.depend();
    return privilegeTable._receiverUserList;
  };
  Meteor.call('getUserInfo', function (err, result) {
    if (err) {
      privilegeTable._receivers = [];
      throwError('无法获取用户信息');
    } else {
      // 更新数据
      privilegeTable._totalUserList = result;
      var stationId = defaultStationId();
      //console.log('defaultStationId: ' + stationId);
      privilegeTable._senderUserList = result.filter(function (e) {
        return e.stationId == stationId;
      });
      privilegeTable._receiverUserList = privilegeTable._senderUserList;
    }
    //console.log('totalUserList: ' + JSON.stringify(currentData._totalUserList));
    privilegeTable._senderUserListListeners.changed();
    privilegeTable._receiverUserListListeners.changed();
  });
});

Template.privilege.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.privilege-keyword').val(key);
  var target = $('#add-privilege');
  target.hide();
});

Template.privilege.onDestroyed(function() {
  privilegeTable = null;
});

Template.privilege.events({
  'keypress .privilege-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.privilege-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.privilege-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-privilege': function (e) {
    e.preventDefault();
    var keyword = $('.privilege-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-privilege': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('privilegeSubmitErrors', {});
    var target = $('#add-privilege');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function () {
          target.addClass('hidden');
        });
      }
    }
  },

  'change .sender-station [name=stationId]': function (e) {
    e.preventDefault();

    var stationId = $(e.currentTarget).val();
    //var data = Template.currentData();
    privilegeTable._senderUserList = privilegeTable._totalUserList
        .filter(function (e) {
          return e.stationId == stationId;
        });
    //console.log('userList: ' + JSON.stringify(data._userList));
    privilegeTable._senderUserListListeners.changed();
  },

  'change .receiver-station [name=stationId]': function (e) {
    e.preventDefault();

    var stationId = $(e.currentTarget).val();
    //var data = Template.currentData();
    privilegeTable._receiverUserList = privilegeTable._totalUserList
        .filter(function (e) {
          return e.stationId == stationId;
        });
    //console.log('userList: ' + JSON.stringify(data._userList));
    privilegeTable._receiverUserListListeners.changed();
  },

  'click .remove-privilege': function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('你确实要删除该员工的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var target = $(e.currentTarget);
    var _id = target.attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('removePrivilege', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-privilege').find('[name=overlap]').val('');
  },

  'submit .add-privilege': function (e) {
    e.preventDefault();
    e.stopPropagation();

    var form = $(e.target);
    var privilege = {
      senderId: form.find('[name=senderId]').val(),
      receiverId: form.find('[name=receiverId]').val()
    };
    var errors = validatePrivilege(privilege);
    if (errors.err) {
      Session.set('privilegeSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('addPrivilege', privilege, function (err) {
      if (err) {
        return throwError(err.reason);
      }
      // 清除可能遗留的错误信息
      Session.set('privilegeSubmitErrors', {});
      var form = $('#add-privilege');
      form.slideUp('fast', function () {
        form.addClass('hidden');
      });
    });
  }
});

function validatePrivilege(privilege) {
  var errors = {};
  if (!privilege) {
    return {err: true, empty: '未提供有效设置内容'};
  }
  if (!privilege.receiverId) {
    errors.receiverId = '未设置自动消息的接收者';
    errors.err = true;
  }
  if (!privilege.senderId) {
    errors.senderId = '未设置自动消息的发送者';
    errors.err = true;
  }
  return errors;
}
