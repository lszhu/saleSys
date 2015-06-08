Template.accountListItem.helpers({
  email: function () {
    return this.emails && this.emails[0].address;
  },
  station: function () {
    return this.stationId && Stations.findOne(this.stationId).name;
  },
  status: function () {
    return this.disabled == '1' ? '禁用' : '启用';
  },
  colorStatus: function () {
    return this.disabled == '1' ? 'danger' : '';
  },
  rightGrade: function () {
    var comments = ['受限', '普通', '特权', '管理'];
    return this.grade && comments[this.grade];
  },
  colorGrade: function () {
    var classes = ['warning', '', 'info', 'success'];
    var index = parseInt(this.grade) || 0;
    return classes[index];
  },
  isAdmin: function () {
    var account = Template.parentData().accounts;
    account = account && account.fetch();
    if (account && account.length != 1) {
      return true;
    }
    return account[0].grade == 3;
  }
});

Template.account.helpers({
  isAdmin: function () {
    var grade = Meteor.users.findOne(Meteor.userId());
    console.log('account grade: ' + grade.grade);
    return grade && grade.grade == 3;
    //return account[0].grade == 3;
  }
});

Template.account.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.account-keyword').val(key);
});

Template.account.events({
  'keypress .account-keyword': function (e, t) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = t.$('.account-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.account-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-account': function (e, t) {
    e.preventDefault();
    var keyword = t.$('.account-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-account': function (e, t) {
    e.preventDefault();
    var target = t.$('#add-account');
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

  'click .update-account': function (e, t) {
    e.preventDefault();
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    var form = t.$('#add-account');
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    form.find('[name=overlap]').val(_id);
    // 如果是当前用户则禁用账号等级和账号禁用设置框
    var disabled = Meteor.userId() == _id;
    t.$('[name=grade]').prop('disabled', disabled);
    t.$('[name=disabled]').prop('disabled', disabled);
    // 显示编辑框
    form.removeClass('hidden');
    fillForm(_id);
  },

  'click .remove-account': function (e, t) {
    e.preventDefault();
    if (!confirm('你确实要删除该销售分部的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('accountRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    t.$('#add-account').find('[name=overlap]').val('');
  },

  'submit .add-account': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var account = {
      username: form.find('[name=username]').val(),
      nickname: form.find('[name=nickname]').val(),
      email: form.find('[name=email]').val(),
      password: $.trim(form.find('[name=password]').val()),
      disabled: form.find('[name=disabled]').val(),
      stationId: form.find('[name=stationId]').val(),
      grade: parseFloat(form.find('[name=grade]').val()),
      comment: form.find('[name=comment]').val()
    };
    var passwordAgain = $.trim(form.find('[name=password-again]').val());
    if (passwordAgain != account.password) {
      alert('两次输入的密码不一致');
      // 不提交，直接返回编辑界面
      return;
    }
    //console.log('account: ' + JSON.stringify(account));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    Meteor.call('accountInsert', {account: account, overlap: overlap});
    // 最后清除表单的内容
    clearForm(e.target);
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=username]').val('');
  form.find('[name=nickname]').val('');
  form.find('[name=email]').val('');
  form.find('[name=password]').val('');
  form.find('[name=password-again]').val('');
  // 设置账号默认为可用状态
  form.find('[name=disabled]').val('0');
  // 销售分部设置为默认货币
  console.log('default currency: ' + defaultStationId());
  form.find('[name=stationId]').val(defaultStationId());
  // 账号等级设置为默认的1级（普通用户）
  form.find('[name=grade]').val(1);
  form.find('[name=comment]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Meteor.users.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-account');
  form.find('[name=username]').val(data.username);
  form.find('[name=nickname]').val(data.nickname);
  form.find('[name=email]').val(data.emails[0] && data.emails[0].address);
  form.find('[name=disabled]').val(data.disabled == '1' ? '1' : '0');
  form.find('[name=stationId]').val(data.stationId);
  form.find('[name=grade]').val(data.grade);
  form.find('[name=comment]').val(data.comment);
}