Template.orderDisposalItem.helpers({
  statusColor: function () {
    var colors = {
      '进行': 'bg-primary',
      '完成': 'bg-success',
      '终止': 'bg-warning'
    };
    return colors[this.status] || 'bg-danger';
  },
  customerName: function () {
    var customer = Customers.findOne(this.customerId);
    return customer && customer.name;
  },
  stationName: function () {
    var station = Stations.findOne(this.stationId);
    return station && station.name;
  }
});

Template.editOrder.onCreated(function () {
  Session.set('editOrderSubmitErrors', {});

  // 必须保证当前模板上下文数据不是未定义
  var currentData = Template.currentData();
  currentData._filteredManagersListener = new Tracker.Dependency();
  currentData._filteredManagers = [{}];
  currentData.getManagers = function () {
    currentData._filteredManagersListener.depend();
    return currentData._filteredManagers;
  };
  // 特权用户必须能查看当前部门所有账号（订单主管）列表
  if (isSuperUser()) {
    var stationId = currentData.stationId || Meteor.user().stationId;
    var query = stationId ? {stationId: stationId} : {};
    currentData._filteredManagers = Meteor.users.find(query).fetch();
    currentData._filteredManagersListener.changed();
    //console.log('filtered managerList: ' +
    //    JSON.stringify(currentData.getManagers()));
    // 如果返回结果为空数组则表明当前的登录账号与所查询订单不在同一个部门
    // 此时需要继续运行下面的代码
    if (currentData._filteredManagers.length > 0) {
      return;
    }
  }
  if (currentData.managerId) {
    Meteor.call('getNameById', currentData.managerId,
        function (error, result) {
          currentData._filteredManagersListener.depend();
          if (error) {
            currentData._filteredManagers = [{
              _id: currentData.managerId,
              profile: {name: '未知'}
            }];
          } else {
            currentData._filteredManagers = [{
              _id: currentData.managerId,
              profile: {name: result}
            }];
          }
          currentData._filteredManagersListener.changed();
          //console.log('filtered managerList: ' +
          //    JSON.stringify(currentData.getManagers()));
        });
  }
});

Template.editOrder.events({
  'change .add-order select[name=stationId]': function (e) {
    var managers = Meteor.users.find({stationId: $(e.target).val()}).fetch();
    var currentData = Template.currentData() || {};
    managers.unshift({});
    currentData._filteredManagers = managers;
    currentData._filteredManagersListener.changed();
  },
  'change .add-order input[name=deadline]': function (e) {
    var t = $(e.target);
    var time = (new Date(t.val())).getTime();
    t.data('time', time ? time : 0);
  }
});

Template.editOrder.helpers({
  hasError: function (field) {
    return !!Session.get('editOrderSubmitErrors')[field] ?
        'has-error' : '';
  },
  isSelected: function (u, v) {
    return u == v ? 'selected' : '';
  },
  time: function (d) {
    return d.getTime();
  },
  formatDate: function (d) {
    if (!d) {
      return '';
    }
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    return year + '-' + month + '-' + day;
  }
});

Template.addOrderDisposal.helpers({
  hasError: function (field) {
    return !!Session.get('addOrderDisposalSubmitErrors')[field] ?
        'has-error' : '';
  }
});

Template.addOrderDisposal.onCreated(function () {
  Session.set('addOrderDisposalSubmitErrors', {});
});

Template.addOrderDisposal.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.order-keyword').val(key);
  var target = $('#add-order');
  target.hide();
});

Template.addOrderDisposal.events({
  'keypress .order-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.order-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-order': function (e) {
    e.preventDefault();
    var keyword = $('.order-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-order': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('orderManagementSubmitErrors', {});
    var target = $('#add-order');
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

  'click .update-order': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('orderManagementSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    var form = $('#add-order');
    // 显示编辑框
    if (form.hasClass('hidden')) {
      form.removeClass('hidden');
      form.slideDown('fast');
    }
    fillForm(_id);
  },

  'click .remove-order': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该员工的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('orderRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-order').find('[name=overlap]').val('');
  },

  'submit .add-order': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var order = {
      code: form.find('[name=code]').val(),
      type: form.find('[name=type]').val(),
      customerId: form.find('[name=customerId]').val(),
      phone: form.find('[name=phone]').val(),
      address: form.find('[name=address]').val(),
      stationId: form.find('[name=stationId]').val(),
      comment: form.find('[name=comment]').val()
    };
    //console.log('order: ' + JSON.stringify(order));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {order: order, overlap: overlap};
    var errors = validateNewOrder(data);
    if (errors.err) {
      Session.set('orderManagementSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('orderInsert', data, function (err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('orderManagementSubmitErrors', {});
      var form = $('#add-order');
      // 清除表单的内容
      clearForm(form);
      form.slideUp('fast', function () {
        form.addClass('hidden');
      });
    });
  }
});

Template.orderDisposal.events({
  'click .order-tool .add-disposal': function (e, t) {
    console.log('添加订单处理记录');
    e.preventDefault();
  },
  'click .order-tool .save-all': function (e, t) {
    console.log('保存订单基本信息及处理记录');
    e.preventDefault();
    var orderInfo = getOrderInfo(t.find('.add-order'));
    console.log('orderInfo: ' + JSON.stringify(orderInfo));
  },
  'click .order-tool .print-preview': function (e, t) {
    console.log('打印预览订单基本信息及处理记录');
  },
  'click .order-tool .remove-order': function (e, t) {
    console.log('删除当前订单基本信息及处理记录');
  }
});

function getOrderInfo(target) {
  var t = $(target);
  var info = {
    code: t.find('[name=code]').val(),
    type: t.find('[name=type]').val(),
    status: t.find('[name=status]').val(),
    // 后面需对customer进一步处理
    customer: t.find('[name=customerNameOrId]'),
    address: t.find('[name=address]').val(),
    phone: t.find('[name=phone]').val(),
    deadline: t.find('[name=deadline]').data('time'),
    stationId: t.find('[name=stationId]').val(),
    managerId: t.find('[name=managerId]').val(),
    comment: t.find('[name=comment]').val()
  };
  // 设置customer，如果显示名称和保存的id值不一致，则说明名称编辑过，采用该值
  // 否则保存对应客户Id（通过下拉按钮选择的客户）
  var customer = Customers.findOne(info.customer.data('customer-id'));
  if (customer && customer.name == info.customer.val() ) {
    info.customer = customer._id;
  } else {
    info.customer = info.customer.val();
  }
  return info;
}

function clearForm(target) {
  var form = $(target);
  form.find('[name=code]').val('');
  form.find('[name=type]').val('');
  form.find('[name=customerId]').val('');
  form.find('[name=phone]').val('');
  form.find('[name=address]').val('');
  form.find('[name=stationId]').val(defaultStationId());
  form.find('[name=comment]').val('');
// 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Orders.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-order');
  form.find('[name=code]').val(data.code);
  form.find('[name=type]').val(data.type);
  form.find('[name=customerId]').val(data.customerId);
  form.find('[name=phone]').val(data.phone);
  form.find('[name=address]').val(data.address);
  form.find('[name=stationId]').val(data.stationId);
  form.find('[name=comment]').val(data.comment);
  // 将id保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
  form.find('[name=overlap]').val(_id);
}