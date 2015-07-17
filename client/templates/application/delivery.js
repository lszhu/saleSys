Template.editDelivery.helpers({
  hasError: function (field) {
    return !!Session.get('deliverySubmitErrors')[field] ? 'has-error' : '';
  },
  deliveryTypes: function () {
    return [
      {name: ''}, {name: '销售'}, {name: '采购'}, {name: '维修'},
      {name: '日常开销'}, {name: '员工预支'}, {name: '工资'}
    ];
  },
  defaultCurrency: defaultCurrency
});

Template.editDelivery.events({
  'change [name=type]': function (e, t) {
    e.preventDefault();

    var value = $(e.currentTarget).val();
    if (value == '员工预支' || value == '工资') {
      $(t.find('.partner-employee')).removeClass('hidden');
      $(t.find('.partner-customer')).addClass('hidden');
    } else {
      $(t.find('.partner-employee')).addClass('hidden');
      $(t.find('.partner-customer')).removeClass('hidden');
    }
  },

  // 资金金额不能为负数，如果输入负数，自动转为其绝对值
  'change [name=value]': function (e) {
    var t = $(e.target);
    var value = t.val();
    console.log('value: ' + value);
    if (isNaN(value)) {
      t.val('');
    } else if (value < 0) {
      t.val(-value);
    }
  }
});

Template.deliveryListItem.helpers({
  stationName: function (id) {
    var station = Stations.findOne(id);
    return station && station.name || '未知';
  },
  operatorName: function(id) {
    var users = Session.get('receiverList');
    return users && users[id] && users[id].name || '未知';
  },
  formatDate: formatDate
});

Template.deliveryListItem.events({
});

Template.delivery.onCreated(function () {
  Session.set('deliverySubmitErrors', {});
  //clearOrderDisposalGoodsLists();
});

Template.delivery.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.delivery-keyword').val(key);
  var target = $('#add-delivery');
  //target.removeClass('hidden');
  target.hide();
});

Template.delivery.events({
  'click td.show-delivery-detail': function(e) {
    e.preventDefault();

    var target = $('tr.goods-list-detail');
    if (target[0] == $(e.currentTarget).parent().next()[0]) {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
      } else {
        target.addClass('hidden');
      }
    } else {
      target.removeClass('hidden')
          .insertAfter($(e.currentTarget).parent())
          .find('.goods-list > .grid')
          .removeClass('hidden');
    }
    // 设置货物清单数据到表格数据源
    var hot = getGoodsListHot(1);
    hot.loadData(this.product);
    console.log('delivery: ' + JSON.stringify(this.product));
  },

  'keypress .delivery-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.delivery-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.delivery-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-delivery': function (e) {
    e.preventDefault();
    var keyword = $('.delivery-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-delivery': function (e) {
    e.preventDefault();

    // 清空可能遗留的错误信息
    Session.set('deliverySubmitErrors', {});
    var target = $('#add-delivery');
    var grid = $('.add-delivery > .goods-list > .grid');
    if (grid.hasClass('hidden')) {
      grid.removeClass('hidden');
    }
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.fadeIn('fast');
      } else {
        target.fadeOut('fast', function () {
          clearForm(target);
          target.addClass('hidden');
        });
      }
    }
  },

  'click .update-delivery': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('deliverySubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-delivery');
    console.log('_id: ' + _id);
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    form.find('[name=overlap]').val(_id);
    // 显示编辑框
    if (form.hasClass('hidden')) {
      form.removeClass('hidden');
      form.slideDown('fast');
    }
    fillForm(_id);
  },

  'click .remove-delivery': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该资金收支信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('deliveryRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-delivery').find('[name=overlap]').val('');
  },

  'submit .add-delivery': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var delivery = {
      type: form.find('[name=type]').val(),
      stationId: form.find('[name=stationId]').val(),
      money: {
        type: '现金',
        value: parseFloat(form.find('[name=value]').val()) || 0,
        currency: form.find('[name=currency]').val()
      },
      comment: form.find('[name=comment]').val(),
      orderId: form.find('[name=orderId]').val(),
      operatorId: Meteor.userId()
    };
    var inOut = form.find('[name=inOut]').val();
    if (inOut == '支出') {
      delivery.money.value = -delivery.money.value;
    } else if (inOut == '收入支票') {
      delivery.money.type = '支票';
    }
    // 检查对象（partnerId）中保存的是Id还是实际名称
    delivery.partnerId = getPartner(delivery.type, e.target);
    console.log('delivery: ' + JSON.stringify(delivery));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    //var data = {delivery: delivery, overlap: overlap};
    // 对输入信息进行校验
    var errors = validateDelivery(delivery);
    if (errors.err) {
      //console.log('errors: ' + JSON.stringify(errors));
      Session.set('deliverySubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    if (overlap) {
      // overlap本身保存的就是集合文档的Id
      Meteor.call('deliveryUpdate', overlap, delivery, function (err) {
        if (err) {
          return throwError(err.reason);
        }
        // 清除可能遗留的错误信息
        Session.set('deliverySubmitErrors', {});
        // 完成同时隐藏编辑表单
        var form = $('#add-delivery');
        // 清除表单的内容
        clearForm(form);
        form.slideUp('fast', function () {
          form.addClass('hidden');
        });
      });
      return;
    }
    Meteor.call('deliveryInsert', delivery, function (err) {
      if (err) {
        return throwError(err.reason);
      }
      // 清除可能遗留的错误信息
      Session.set('deliverySubmitErrors', {});
      // 完成同时隐藏编辑表单
      var form = $('#add-delivery');
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
  form.find('[name=type]').val('');
  form.find('[name=inOut]').val('');
  //form.find('[name=stationId]').val('');
  form.find('[name=orderId]').val('');
  form.find('[name=employeeId]').val('');
  form.find('[name=customerNameOrId]').val('');
  form.find('[name=value]').val('');
  //form.find('[name=currency]').val('');
  form.find('[name=comment]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Deliveries.findOne(_id);
  console.log('data: ' + JSON.stringify(data));
  if (!data || !data.money) {
    return;
  }
  var money = data.money;
  var form = $('#add-delivery');
  form.find('[name=type]').val(data.type);
  form.find('[name=orderId]').val(data.orderId);
  form.find('[name=stationId]').val(data.stationId);
  form.find('[name=value]').val(Math.abs(money.value));
  form.find('[name=comment]').val(data.comment);
  form.find('[name=currency]').val(data.money.currency);
  var inOut = '收入现金';
  if (money.value < 0) {
    inOut = '支出';
  } else if (money.type == '支票') {
    inOut = '收入支票';
  }
  form.find('[name=inOut]').val(inOut);

  if (data.type == '员工预支' || data.type == '工资') {
    form.find('.partner-employee').removeClass('hidden');
    form.find('.partner-customer').addClass('hidden');
    return form.find('[name=employeeId]').val(data.partnerId);
  }
  form.find('.partner-employee').addClass('hidden');
  form.find('.partner-customer').removeClass('hidden');
}

function getPartner(type, dom) {
  if (type == '员工预支' || type == '工资') {
    return $(dom).find('.partner-employee select').val();
  }
  var target = $(dom).find('.partner-customer input');
  var customer = Customers.findOne(target.data('customerId'));
  if (customer && customer.name == target.val()) {
    return target.data('customerId');
  } else {
    return target.val();
  }
}
