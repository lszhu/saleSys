Template.monitorListItem.helpers({
  sender: function() {
    var data = Template.currentData();
    if (!data || !data.senderId) {
      return '未知';
    }
    var sender = Meteor.users.findOne(data.senderId);
    console.log('sender: ' + JSON.stringify(sender));
    if (!sender) {
      return '未知';
    }
    var station = Stations.findOne(sender.stationId);
    sender = sender.profile.name;
    station = station && station.name;
    return station + ' - ' + sender;
  },

  receiver: function() {
    console.log('receiver: ' + Template.currentData());
    var data = Template.currentData();
    if (!data || !data.receiverId) {
      return '未知';
    }
    var receiver = Meteor.users.findOne(data.receiverId);
    if (!receiver) {
      return '未知';
    }
    var station = Stations.findOne(receiver.stationId);
    receiver = receiver.profile.name;
    station = station && station.name;
    return station + ' - ' + receiver;
  }
});

Template.monitorList.helpers({
  monitors: function() {
    return Monitors.find();
  }
});

Template.addMonitor.helpers({
  hasError: function(field) {
    return !!Session.get('monitorSubmitErrors')[field] ? 'has-error' : '';
  },
  senderUserList: function() {
    return Template.parentData().getSenderUserList();
  },
  receiverUserList: function() {
    return Template.parentData().getReceiverUserList();
  }
});

Template.monitor.onCreated(function() {
  Session.set('monitorSubmitErrors', {});
  // 必须保证当前模板上下文数据不是未定义
  var currentData = Template.currentData();
  //console.log('currentData: ' + currentData);
  currentData._senderUserList = [];
  currentData._senderUserListListeners = new Tracker.Dependency();
  currentData.getSenderUserList = function () {
    currentData._senderUserListListeners.depend();
    return currentData._senderUserList;
  };
  currentData._receiverUserList = [];
  currentData._receiverUserListListeners = new Tracker.Dependency();
  currentData.getReceiverUserList = function () {
    currentData._receiverUserListListeners.depend();
    return currentData._receiverUserList;
  };
  Meteor.call('getUserInfo', function (err, result) {
    if (err) {
      currentData._receivers = [];
      throwError('无法获取用户信息');
    } else {
      // 更新数据
      currentData._totalUserList = result;
      var stationId = defaultStationId();
      //console.log('defaultStationId: ' + stationId);
      currentData._senderUserList = result.filter(function (e) {
        return e.stationId == stationId;
      });
      currentData._receiverUserList = currentData._senderUserList;
    }
    //console.log('totalUserList: ' + JSON.stringify(currentData._totalUserList));
    currentData._senderUserListListeners.changed();
    currentData._receiverUserListListeners.changed();
  });
});

Template.monitor.onRendered(function() {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.monitor-keyword').val(key);
  var target = $('#add-monitor');
  target.hide();
});

Template.monitor.events({
  'keypress .monitor-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.monitor-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.monitor-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-monitor': function (e) {
    e.preventDefault();
    var keyword = $('.monitor-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-monitor': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('monitorSubmitErrors', {});
    var target = $('#add-monitor');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function() {
          target.addClass('hidden');
        });
      }
    }
  },

  'change .sender-station [name=stationId]': function(e) {
    e.preventDefault();

    var stationId = $(e.currentTarget).val();
    var data = Template.currentData();
    data._senderUserList = data._totalUserList.filter(function(e) {
      return e.stationId == stationId;
    });
    //console.log('userList: ' + JSON.stringify(data._userList));
    data._senderUserListListeners.changed();
  },

  'change .receiver-station [name=stationId]': function(e) {
    e.preventDefault();

    var stationId = $(e.currentTarget).val();
    var data = Template.currentData();
    data._receiverUserList = data._totalUserList.filter(function(e) {
      return e.stationId == stationId;
    });
    //console.log('userList: ' + JSON.stringify(data._userList));
    data._receiverUserListListeners.changed();
  },

  'click .remove-monitor': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该员工的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var target = $(e.currentTarget);
    var _id = target.href();
    //console.log('_id: ' + _id);
    Meteor.call('removeMonitor', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-monitor').find('[name=overlap]').val('');
  },

  'submit .add-monitor': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var monitor = {
      senderId: form.find('[name=senderId]').val(),
      receiverId: form.find('[name=receiverId]').val()
    };
    var errors = validateMonitor(monitor);
    if (errors.err) {
      Session.set('monitorSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('addMonitor', monitor, function(err) {
      if (err) {
        return throwError(err.reason);
      }
      // 清除可能遗留的错误信息
      Session.set('monitorSubmitErrors', {});
      var form = $('#add-monitor');
      form.slideUp('fast', function () {
        form.addClass('hidden');
      });
    });
  }
});

function validateMonitor(monitor) {
  var errors = {};
  if (!monitor) {
    return {err: true, empty: '未提供有效设置内容'};
  }
  if (!monitor.receiverId) {
    errors.receiverId = '未设置自动消息的接收者';
    errors.err = true;
  }
  if (!monitor.senderId) {
    errors.senderId = '未设置自动消息的发送者';
    errors.err = true;
  }
  return errors;
}
