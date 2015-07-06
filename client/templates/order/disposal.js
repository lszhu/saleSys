Template.orderDisposalItem.helpers({
  statusColor: function () {
    var colors = {
      '进行': 'bg-primary',
      '完成': 'bg-success',
      '终止': 'bg-warning'
    };
    return colors[this.status] || 'bg-danger';
  },
  formatDate: formatDate,
  formatTime: formatTime,
  customerName: function () {
    var customer = Customers.findOne(this.customerId);
    return customer && customer.name;
  },
  stationName: function () {
    var station = Stations.findOne(this.stationId);
    return station && station.name;
  }
});

Template.orderDisposalItem.onRendered(function () {
  var detail = this.find('.order-disposal-item > .panel');
  $(detail).hide();
});

Template.orderDisposalItem.events({
  'click .open-detail': function (e, t) {
    e.preventDefault();

    var target = $(e.target);
    var detail = t.find('.order-disposal-item > .panel');
    detail = $(detail);
    if (detail.hasClass('hide-me')) {
      detail.removeClass('hide-me');
      detail.slideDown('normal');
      target.find('.fa-caret-down')
          .removeClass('fa-caret-down')
          .addClass('fa-caret-up');
    } else {
      detail.slideUp('normal', function () {
        detail.addClass('hide-me');
        target.find('.fa-caret-up')
            .removeClass('fa-caret-up')
            .addClass('fa-caret-down');
      });
    }
  }
});

Template.editOrder.onCreated(function () {
  Session.set('editOrderSubmitErrors', {});

  // 必须保证当前模板上下文数据不是未定义，参考路由配置
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
  'change .edit-order select[name=stationId]': function (e) {
    var managers = Meteor.users.find({stationId: $(e.target).val()}).fetch();
    var currentData = Template.currentData() || {};
    managers.unshift({});
    currentData._filteredManagers = managers;
    currentData._filteredManagersListener.changed();
  },
  'change .edit-order input[name=deadline]': function (e) {
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

Template.orderDisposalDetail.helpers({
  selectionItem: function () {
    return {
      disposalTypes: [
        {name: ''}, {name: '备货'}, {name: '发货'}, {name: '收货'},
        {name: '换货'}, {name: '退货'}, {name: '收款'}, {name: '付款'},
        {name: '退款'}, {name: '维修'}, {name: '报废'}
      ],
      goodsTypes: [
        {name: ''}, {name: '出库'}, {name: '入库'}, {name: '其它'}
      ],
      accountTypes: [
        {name: ''}, {name: '收入现金'}, {name: '收入支票'}, {name: '支出'}
      ],
      capitalTypes: [
        {name: ''}, {name: '销售'}, {name: '采购'},
        {name: '维护'}, {name: '日常开销'}
      ]
    };
  },
  isSelected: function (attr) {
    var selection = Template.parentData();
    selection = selection && selection.disposal && selection.disposal.type;
    //console.log('selection: ' + selection);
    return attr == selection ? 'selected' : '';
  },
  isSelectedAccount: function(attr) {

  },
  isSelectedCapital: function(attr) {
    var data = Template.parentData();
    console.log('disposal data: ' + JSON.stringify(data));
    var capital = data && data.capital;
    capital && console.log('capital: ' + JSON.stringify(capital));
    return capital && capital.type == attr ? 'selected' : '';
  },
  isSelectedAccount: function(attr) {
    var data = Template.parentData();
    data = data ? data.capital : null;
    console.log('account data: ' + JSON.stringify(data));
    if (!data || !data.money || !data.money.value) {
      return '' == attr ? 'selected' : '';
    } else if (data.money.value < 0) {
      return '支出' == attr ? 'selected' : '';
    }
    return '收入' + data.money.type == attr ? 'selected' : '';
  },
  absolute: function(v) {
    return Math.abs(v);
  },
  hasError: function (field) {
    return !!Session.get('orderDisposalDetailSubmitErrors')[field] ?
        'has-error' : '';
  },
  managerId: function () {
    return Meteor.userId();
  },
  managerName: function () {
    var user = Meteor.user();
    return user && user.profile.name;
  },
  time: function (d) {
    return d && d.getTime() ? d.getTime() : 0;
  },
  formatDate: formatDate
});

Template.orderDisposalDetail.onCreated(function () {
  Session.set('orderDisposalDetailSubmitErrors', {});
});

Template.orderDisposalDetail.onRendered(function () {
  //var key = this.data.filterKey;

});

Template.orderDisposalDetail.events({
  // 根据用户输入的时间更新DOM附件数据
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
  },

  // 保存订单的当前处理内容
  'click .fa-check': function (e) {
    e.preventDefault();

    console.log('clicked, data is: ' + JSON.stringify(hot.getData()));
    console.log('保存当前订单处理');
  },

  // 删除订单的当前处理内容
  'click .fa-trash-o': function (e) {
    e.preventDefault();

    console.log('删除当前订单处理');
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
  $('#order-disposal-detail').hide();
});

Template.orderDisposal.helpers({
  // 为每个处理内容关联上索引号并按时间排序，同时插入对应资金收支和货物处理信息
  indexDisposal: function () {
    var data = Template.currentData();
    var disposal = data && data.order && data.order.disposal;
    if (!disposal) {
      return;
    }
    data = [];
    for (var i = 0; i < disposal.length; i++) {
      data.push({
        index: i,
        disposal: disposal[i],
        capital: Capitals.findOne(disposal[i].capitalId),
        delivery: Deliveries.findOne(disposal[i].deliveryId)
      });
    }
    data.sort(function (a, b) {
      return a.disposal.timestamp.valueOf() - b.disposal.timestamp.valueOf();
    });
    console.log('disposal data: ' + JSON.stringify(data));
    return data;
  }
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
    var disposal = $('#order-disposal-detail');
    // 确保首次显示页面时是隐藏的
    if (disposal.hasClass('hidden')) {
      disposal.removeClass('hidden');
      disposal.hide();
    }
    if (disposal.hasClass('hide-me')) {
      disposal.removeClass('hide-me');
      disposal.slideDown('normal', function () {
        // 设置订单处理日期时间
        disposal.find('[name=timestamp]')
            .val(formatDate(new Date))
            .data('time', Date.now());
      });
    } else {
      disposal.slideUp('normal', function () {
        disposal.addClass('hide-me');
      });
    }
  },

  // 保存订单基本信息及处理记录
  'click .order-tool .save-all': function (e, t) {
    console.log('保存订单基本信息及处理记录');
    e.preventDefault();

    var orderInfo = getOrderInfo(t.find('.edit-order'));
    // 如果含有hidden类表示隐藏了订单处理部分，提交时也相应忽略这部分
    var disposal = t.find('#order-disposal-detail');
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
    delivery: {
      type: t.find('[name=goodsType]').val(),
      comment: t.find('[name=goodsComment]').val()
    },
    capital: {
      type: t.find('[name=capitalType]').val(),
      comment: t.find('[name=capitalComment]').val()
    }
  };
  // 存在delivery.type说明delivery内容有效，分析并添加具体内容
  if (info.delivery.type) {
    info.delivery.product = getGoodsList(t.find('.delivery .grid'));
  }

  var accountType = t.find('[name=accountType]').val();
  var value = parseFloat(t.find('[name=capitalValue]').val());
  value = value ? value : 0;
  var money = {currency: t.find('[name=currency]').val()};
  if (accountType == '收入现金') {
    money.value = +value;
    money.type = '现金';
  } else if (accountType == '收入支票') {
    money.value = +value;
    money.type = '支票';
  } else if (accountType == '支出') {
    money.value = -value;
    money.type = '现金';
  } else if (accountType != '') {
    throwError('资金操作类型不正确');
  }
  info.capital.money = money;
  // 如果订单处理时间值未定义则设为0以满足校验
  if (!info.timestamp) {
    info.timestamp = 0;
  }
  return info;
}

function getGoodsList(target) {
  // todo
  //console.log('clicked, data is: ' + JSON.stringify(hot.getData()));
  return hot.getData();
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
    deadline: parseInt(t.find('[name=deadline]').data('time')),
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
