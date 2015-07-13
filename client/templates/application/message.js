Template.receiverSelection.helpers({
  receiverList: function() {
    var currentData = Template.currentData();
    return currentData ? currentData.getReceivers() : [];
    return [
      {name: 'aaa', receivers: [
        {_id: 'tafsa', name: 'gssdf'}, {_id: 'asdf', name: 'juasdk'}
      ]},
      {name: 'bbb', receivers: [
        {_id: 'jas', name: 'h234'}, {_id: '2esd', name: 'sdfi23'}
      ]}
    ];
  }
});

Template.receiverSelection.onCreated(function() {
  // 必须保证当前模板上下文数据不是未定义
  var currentData = Template.currentData();
  currentData._receivers = [];
  currentData._receiversListeners = new Tracker.Dependency();
  currentData.getReceivers = function() {
    currentData._receiversListeners.depend();
    return currentData._receivers;
  };
  Meteor.call('getUserInfo', function(err, result) {
    if (err) {
      currentData._receivers = [];
      throwError('无法获取用户信息');
    } else {
      currentData._receivers = classifyReceivers(result);
    }
    currentData._receiversListeners.changed();
  });
});

Template.addMessage.helpers({
  hasError: function (field) {
    return !!Session.get('messageSubmitErrors')[field] ? 'has-error' : '';
  },

  types: function() {
    return [
      {name: ''}, {name: '备货'}, {name: '发货'}, {name: '收货'},
      {name: '换货'}, {name: '退货'}, {name: '收款'}, {name: '付款'},
      {name: '退款'}, {name: '维修'}, {name: '报废'}, {name: '其它'}
    ];
  }

});

Template.messageList.helpers({
  formatDate: formatDate
});

Template.message.onCreated(function() {
  Session.set('messageSubmitErrors', {});
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
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function () {
          clearForm(target);
          target.addClass('hidden');
        });
      }
    }
  },

  'click .update-message': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('messageSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-message');
    //console.log('_id: ' + _id);
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    form.find('[name=overlap]').val(_id);
    // 显示编辑框
    if (form.hasClass('hidden')) {
      form.removeClass('hidden');
      form.slideDown('fast');
    }
    fillForm(_id);
  },

  'click .remove-message': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该客户的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('messageRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-message').find('[name=overlap]').val('');
  },

  'submit .add-message': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var message = {
      code: form.find('[name=code]').val(),
      name: form.find('[name=name]').val(),
      company: form.find('[name=company]').val(),
      title: form.find('[name=title]').val(),
      phone: form.find('[name=phone]').val(),
      email: form.find('[name=email]').val(),
      address: form.find('[name=address]').val(),
      memo: form.find('[name=memo]').val()
    };
    console.log('message: ' + JSON.stringify(message));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {message: message, overlap: overlap};
    // 对一些特别情况需要用户进行确认
    if (!confirmMessageInfo(data)) {
      return;
    }
    // 对输入信息进行校验
    var errors = validateMessage(data);
    if (errors.err) {
      //console.log('errors: ' + JSON.stringify(errors));
      Session.set('messageSubmitErrors', errors);
      if (errors.err) {
        throwError(getErrorMessage(errors));
      }
      return;
    }
    Meteor.call('messageInsert', data, function (err) {
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
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=code]').val('');
  form.find('[name=name]').val('');
  form.find('[name=company]').val('');
  form.find('[name=title]').val('');
  form.find('[name=phone]').val('');
  form.find('[name=email]').val('');
  form.find('[name=address]').val('');
  form.find('[name=memo]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Messages.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-message');
  form.find('[name=code]').val(data.code);
  form.find('[name=name]').val(data.name);
  form.find('[name=company]').val(data.company);
  form.find('[name=title]').val(data.title);
  form.find('[name=phone]').val(data.phone);
  form.find('[name=email]').val(data.email);
  form.find('[name=address]').val(data.address);
  form.find('[name=memo]').val(data.memo);
}

function confirmMessageInfo(data) {
  var message = data.message;
  if (data.overlap) {
    return true;
  }
  if (message.name && Messages.findOne({name: message.name})) {
    if (!confirm('系统中已存在同名客户，还有继续添加此客户吗？')) {
      return false;
    }
  }
  if (message.phone && Messages.findOne({phone: message.phone})) {
    if (!confirm('系统中已存在客户使用此电话号码，还有继续添加此客户吗？')) {
      return false;
    }
  }
  if ( message.email && Messages.findOne({email: message.email})) {
    if (!confirm('系统中已存在客户使用此电子邮箱，还有继续添加此客户吗？')) {
      return false;
    }
  }
  return true;
}