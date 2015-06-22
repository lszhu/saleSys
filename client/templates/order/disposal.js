Template.orderDisposalItem.helpers({
  statusColor: function() {
    var colors = {
      '进行': 'bg-primary',
      '完成': 'bg-success',
      '终止': 'bg-warning'
    };
    return colors[this.status] || 'bg-danger';
  },
  customerName: function() {
    var customer = Customers.findOne(this.customerId);
    return customer && customer.name;
  },
  stationName: function () {
    var station = Stations.findOne(this.stationId);
    return station && station.name;
  }
});

Template.editOrder.helpers({
  hasError: function (field) {
    return !!Session.get('orderManagementSubmitErrors')[field] ?
        'has-error' : '';
  }
});

Template.addOrderDisposal.helpers({
  hasError: function (field) {
    return !!Session.get('orderManagementSubmitErrors')[field] ?
        'has-error' : '';
  }
});

Template.addOrderDisposal.onCreated(function() {
  Session.set('orderManagementSubmitErrors', {});
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
    var order= {
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