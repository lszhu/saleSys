Template.employeeListItem.helpers({
  stationName: function () {
    var station = Stations.findOne(this.stationId);
    return station && station.name;
  }
});

Template.addEmployee.helpers({
  hasError: function(field) {
    return !!Session.get('employeeSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.employee.onRendered(function() {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.employee-keyword').val(key);
  var target = $('#add-employee');
  target.hide();
});

Template.employee.events({
  'keypress .employee-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.employee-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.employee-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-employee': function (e) {
    e.preventDefault();
    var keyword = $('.employee-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-employee': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('employeeSubmitErrors', {});
    var target = $('#add-employee');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function() {
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

  'click .update-employee': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('employeeSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-employee');
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

  'click .remove-employee': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该员工的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('employeeRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-employee').find('[name=overlap]').val('');
  },

  'submit .add-employee': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var employee = {
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
    //console.log('employee: ' + JSON.stringify(employee));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {employee: employee, overlap: overlap};
    var errors = validateEmployee(data);
    if (errors.err) {
      Session.set('employeeSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('employeeInsert', data, function(err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('employeeSubmitErrors', {});
      var form = $('#add-employee');
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
  var data = Employees.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-employee');
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