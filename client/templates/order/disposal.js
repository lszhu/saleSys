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
    var target = $(e.target);
    var t = target.val().split('-');
    var time = new Date(t[0], t[1] - 1, t[2]);
    if (time.toString() == 'Invalid Date') {
      throwError('交货截至日期填写有误！');
      time = 0;
    } else {
      time = time.getTime();
    }
    target.data('time', time);
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
    return d && d.getTime() ? d.getTime() : 0;
  },
  formatDate: formatDate
});

Template.addOrderDisposal.helpers({
  hasError: function (field) {
    return !!Session.get('addOrderDisposalSubmitErrors')[field] ?
        'has-error' : '';
  },
  managerId: function () {
    return Meteor.userId();
  },
  managerName: function () {
    var user = Meteor.user();
    return user && user.profile.name;
  },
  formatDate: formatDate
});

Template.addOrderDisposal.onCreated(function () {
  Session.set('addOrderDisposalSubmitErrors', {});
});

Template.addOrderDisposal.onRendered(function () {
  //var key = this.data.filterKey;
  //console.log('key: ' + key);
  //this.$('.order-keyword').val(key);
  //$('#add-order').hide();


});

Template.addOrderDisposal.events({
  'change [name=timestamp]': function (e) {
    var t = $(e.target);
    var d = t && t.val() && t.val().split('-');
    // 如果手工设定的日期，则假设时间为下午6点（通常为下班时间）
    var time = (new Date(d[0], d[1] - 1, d[2], 18));
    if (time.toString() == 'Invalid Date') {
      throwError('订单处理时间填写有误！');
      time = 0;
    } else {
      time = time.getTime();
    }
    t.data('time', time);
  }
});

Template.orderDisposal.onCreated(function () {
  // 当打开特定Id的订单失败（比如对于Id的订单不存在）时进入创建订单详情页面
  var data = Template.currentData();
  //console.log('data: ' + JSON.stringify(data));
  if (!data.order || !data.order._id) {
    Router.go('/order');
  }
});

Template.orderDisposal.onRendered(function () {
  // 刚加载订单处理页面时不显示订单处理的表单
  $('#add-order-disposal').hide();
});

Template.orderDisposal.events({
  // 添加订单处理记录
  'click .order-tool .add-disposal': function (e) {
    console.log('添加订单处理记录');
    e.preventDefault();

    var data = Template.currentData();
    if (!data || !data.order || !data.order._id) {
      throwError('请先填写并保存订单基本信息');
      //alert('请先保存订单基本信息！');
      return;
    }
    var disposal = $('#add-order-disposal');
    if (disposal.hasClass('hidden')) {
      disposal.removeClass('hidden');
      disposal.fadeIn('normal', function () {
        // 设置订单处理日期时间
        disposal.find('[name=timestamp]')
            .val(formatDate(new Date))
            .data('time', Date.now());
      });
    } else {
      disposal.fadeOut('normal', function () {
        disposal.addClass('hidden');
      });
    }
  },

  // 保存订单基本信息及处理记录
  'click .order-tool .save-all': function (e, t) {
    console.log('保存订单基本信息及处理记录');
    e.preventDefault();

    var orderInfo = getOrderInfo(t.find('.add-order'));
    // 如果含有hidden类表示隐藏了订单处理部分，提交时也相应忽略这部分
    var disposal = t.find('#add-order-disposal');
    var disposalInfo = {};
    var $disposal = $(disposal);
    if (!$disposal.hasClass('hidden')) {
      disposalInfo = getDisposalInfo(disposal);
    }

    var order = _.extend(orderInfo, {disposal: disposalInfo});
    console.log('order: ' + JSON.stringify(order));
    var errors = validateOrderBase(order);
    if (errors.err) {
      Session.set('orderManagementSubmitErrors', errors);
      return throwError(getErrorMessage(errors));
    }
    // 如果当前加载了订单，则获取对应id，当前为订单更新操作
    var currentOrder = Template.currentData().order;
    var orderId = currentOrder && currentOrder._id ? currentOrder._id : '';
    if (orderId) {
      Meteor.call('orderUpdate', orderId, order, function (err) {
        if (err) {
          return throwError(err.reason);
        }
        // 清空并隐藏订单处理部分
        clearDisposalInfo(disposal);
        $disposal.fadeOut('normal', function () {
          $disposal.addClass('hidden');
        });
      });
    } else {
      Meteor.call('orderInsert', order, function (err, orderId) {
        if (err) {
          return throwError(err.reason);
        }
        // 转到当前保存订单的处理界面
        Router.go('/order/' + orderId);
      });
    }
  },

  // 打印预览订单基本信息及处理记录
  'click .order-tool .print-preview': function (e, t) {
    console.log('打印预览订单基本信息及处理记录');
  },

  // 删除当前订单基本信息及处理记录
  'click .order-tool .remove-order': function (e, t) {
    console.log('删除当前订单基本信息及处理记录');
    e.preventDefault();

    // 获取对应数据库条目Id
    var _id = this.order && this.order._id;
    console.log('_id: ' + _id);
    if (!confirm('你确实要删除该订单的所有相关信息吗？')) {
      return;
    }
    Meteor.call('orderRemove', _id, function (err) {
      //if (err) {
      //  return throwError(err.reason);
      //}
      //Router.go('/order');
      err ? throwError(err.reason) : Router.go('/order');
    });
  }
});

function clearDisposalInfo(target) {
  var t = $(target);
  t.find('[name=timestamp]').data('time');
  t.find('[name=disposalType]').val();
  t.find('[name=managerId]').val();
  t.find('[name=disposalComment]').val();
  t.find('[name=goodsType]').val();
  t.find('[name=goodsComment]').val();
  clearGoodsList(t.find('.delivery .grid'));
  t.find('[name=capitalType]').val();
  t.find('[name=accountType]').val();
  t.find('[name=capitalComment]').val();
  t.find('[name=value]').val();
  t.find('[name=currency]').val();
}

function getDisposalInfo(target) {
  var t = $(target);
  var info = {
    index: t.data('index'),
    timestamp: t.find('[name=timestamp]').data('time'),
    type: t.find('[name=disposalType]').val(),
    managerId: t.find('[name=managerId]').val(),
    comment: t.find('[name=disposalComment]').val(),
    goods: {
      type: t.find('[name=goodsType]').val(),
      comment: t.find('[name=goodsComment]').val(),
      list: getGoodsList(t.find('.delivery .grid'))
    },
    capital: {
      type: t.find('[name=capitalType]').val(),
      accountType: t.find('[name=accountType]').val(),
      comment: t.find('[name=capitalComment]').val(),
      value: t.find('[name=value]').val(),
      currency: t.find('[name=currency]').val()
    }
  };
  // 如果订单处理时间值未定义则设为0以满足校验
  if (!info.timestamp) {
    info.timestamp = 0;
  }
  return info;
}

function getGoodsList(target) {
  // todo
  return ['for test'];
}

function clearGoodsList(target) {
  // todo
}

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
  if (customer && customer.name == info.customer.val()) {
    info.customer = customer._id;
  } else {
    info.customer = info.customer.val();
  }
  // 如果期限（deadline）未定义则指定为0，以满足校验
  if (!info.deadline) {
    info.deadline = 0;
  }
  return info;
}
