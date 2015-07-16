Template.editCapital.helpers({
  hasError: function (field) {
    return !!Session.get('capitalSubmitErrors')[field] ? 'has-error' : '';
  },
  capitalTypes: function () {
    return [
      {name: ''}, {name: '销售'}, {name: '采购'}, {name: '维修'},
      {name: '日常开销'}, {name: '员工预支'}, {name: '工资'}
    ];
  },
  defaultCurrency: defaultCurrency
});

Template.editCapital.events({
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

Template.capitalListItem.helpers({
  inOut: function () {
    if (!this.money) {
      return '未知';
    }
    if (this.money.value < 0) {
      return '支出';
    }
    return '收入' + this.money.type;
  },
  stationName: function (id) {
    var station = Stations.findOne(id);
    return station && station.name || '未知';
  },
  partner: function (id) {
    var t = this.type;
    if (t == '员工预支' || t == '工资') {
      var employee = Employees.findOne(id);
      return employee ? employee.name : id;
    } else {
      var customer = Customers.findOne(id);
      return customer ? customer.name : id;
    }
  },
  formatMoney: function (v, c) {
    if (v < 0) {
      v = -v;
    }
    return c + toDecimal2(v);
  },
  formatDate: formatDate
});

Template.capital.onCreated(function () {
  Session.set('capitalSubmitErrors', {});
});

Template.capital.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.capital-keyword').val(key);
  var target = $('#add-capital');
  //target.removeClass('hidden');
  target.hide();
});

Template.capital.events({
  'keypress .capital-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.capital-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.capital-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-capital': function (e) {
    e.preventDefault();
    var keyword = $('.capital-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-capital': function (e) {
    e.preventDefault();

    // 清空可能遗留的错误信息
    Session.set('capitalSubmitErrors', {});
    var target = $('#add-capital');
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

  'click .update-capital': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('capitalSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-capital');
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

  'click .remove-capital': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该资金收支信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('capitalRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-capital').find('[name=overlap]').val('');
  },

  'submit .add-capital': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var capital = {
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
      capital.money.value = -capital.money.value;
    } else if (inOut == '收入支票') {
      capital.money.type = '支票';
    }
    // 检查对象（partnerId）中保存的是Id还是实际名称
    capital.partnerId = getPartner(capital.type, e.target);
    console.log('capital: ' + JSON.stringify(capital));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    //var data = {capital: capital, overlap: overlap};
    // 对输入信息进行校验
    var errors = validateCapital(capital);
    if (errors.err) {
      //console.log('errors: ' + JSON.stringify(errors));
      Session.set('capitalSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    if (overlap) {
      // overlap本身保存的就是集合文档的Id
      Meteor.call('capitalUpdate', overlap, capital, function (err) {
        if (err) {
          return throwError(err.reason);
        }
        // 清除可能遗留的错误信息
        Session.set('capitalSubmitErrors', {});
        // 完成同时隐藏编辑表单
        var form = $('#add-capital');
        // 清除表单的内容
        clearForm(form);
        form.slideUp('fast', function () {
          form.addClass('hidden');
        });
      });
      return;
    }
    Meteor.call('capitalInsert', capital, function (err) {
      if (err) {
        return throwError(err.reason);
      }
      // 清除可能遗留的错误信息
      Session.set('capitalSubmitErrors', {});
      // 完成同时隐藏编辑表单
      var form = $('#add-capital');
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
  var data = Capitals.findOne(_id);
  console.log('data: ' + JSON.stringify(data));
  if (!data || !data.money) {
    return;
  }
  var money = data.money;
  var form = $('#add-capital');
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
  var employee = Employees.findOne(data.partnerId);
  var partner = form.find('[name=customerNameOrId]');
  if (employee) {
    partner.data('employeeId', employee._id).val(employee.name);
  } else {
    partner.val(data.partnerId);
  }
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
