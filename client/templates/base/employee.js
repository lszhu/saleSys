Template.employee.helpers({
  temp: function () {
  }
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
    var target = $('#add-employee');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      target.toggleClass('hidden');
    }
    // 清空表单中填入的内容
    //clearForm(target);
    // 显示编辑框
    //target.removeClass('hidden');
  },

  'click .update-employee': function(e) {
    e.preventDefault();
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    $('#add-employee').find('[name=overlap]').val(_id);
    // 显示编辑框
    $('#add-employee').removeClass('hidden');
    fillForm(_id);
  },

  'click .remove-employee': function(e) {
    e.preventDefault();
    if (!confirm('你确实要删除该销售分部的信息吗？')) {
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
      manager: form.find('[name=manager]').val(),
      address: form.find('[name=address]').val(),
      comment: form.find('[name=comment]').val(),
      memo: form.find('[name=memo]').val()
    };
    console.log('employee: ' + JSON.stringify(employee));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    Meteor.call('employeeInsert', {employee: employee, overlap: overlap});
    // 最后清除表单的内容
    clearForm(e.target);
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=code]').val('');
  form.find('[name=name]').val('');
  form.find('[name=manager]').val('');
  form.find('[name=address]').val('');
  form.find('[name=comment]').val('');
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
  form.find('[name=manager]').val(data.manager);
  form.find('[name=address]').val(data.address);
  form.find('[name=comment]').val(data.comment);
  form.find('[name=memo]').val(data.memo);
}