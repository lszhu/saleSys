Template.orderListItem.helpers({
  customerName: function() {
    var customer = Customers.findOne(this.customerId);
    return customer && customer.name;
  },
  stationName: function () {
    var station = Stations.findOne(this.stationId);
    return station && station.name;
  }
});

Template.addOrder.helpers({
  hasError: function (field) {
    return !!Session.get('orderManagementSubmitErrors')[field] ?
        'has-error' : '';
  }
});

Template.orderManagement.onCreated(function() {
  Session.set('orderManagementSubmitErrors', {});
});

Template.orderManagement.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.order-keyword').val(key);
  var target = $('#add-order');
  target.hide();
});

Template.orderManagement.events({
  'keypress .order-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.order-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.order-keyword').val());
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
    // 清空表单中填入的内容
    //clearForm(target);
    // 显示编辑框
    //target.removeClass('hidden');
  },

  'click .update-order': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('orderManagementSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-order');
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
      name: form.find('[name=name]').val(),
      sex: form.find('[name=sex]').val(),
      title: form.find('[name=title]').val(),
      phone: form.find('[name=phone]').val(),
      email: form.find('[name=email]').val(),
      stationId: form.find('[name=stationId]').val(),
      salary: {
        value: parseFloat(form.find('[name=salaryValue]').val()),
        currency: form.find('[name=currency]').val()
      },
      memo: form.find('[name=memo]').val()
    };
    //console.log('order: ' + JSON.stringify(order));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {order: order, overlap: overlap};
    var errors = validateOrder(data);
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
  form.find('[name=name]').val('');
  form.find('[name=sex]').val('');
  form.find('[name=title]').val('');
  form.find('[name=phone]').val('');
  form.find('[name=email]').val('');
  form.find('[name=stationId]').val(defaultStationId());
  form.find('[name=salaryValue]').val('');
  form.find('[name=currency]').val(defaultCurrency());
  form.find('[name=memo]').val('');
// 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Orders.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-order');
  form.find('[name=code]').val(data.code);
  form.find('[name=name]').val(data.name);
  form.find('[name=sex]').val(data.sex);
  form.find('[name=title]').val(data.title);
  form.find('[name=phone]').val(data.phone);
  form.find('[name=email]').val(data.email);
  form.find('[name=stationId]').val(data.stationId);
  form.find('[name=salaryValue]').val(data.salary.value);
  form.find('[name=currency]').val(data.salary.currency);
  form.find('[name=memo]').val(data.memo);
}