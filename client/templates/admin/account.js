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
    return comments[this.grade];
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

Template.addAccount.helpers({
  hasError: function (field) {
    return !!Session.get('accountSubmitErrors')[field] ? 'has-error' : '';
  },
  showForAdmin: function () {
    var user = Meteor.user();
    return user && user.grade == 3 ? '' : 'hidden';
  }
});

/*
 Template.account.onRendered(function () {
 this.find('#add-account')._uihooks = {
 insertElement: function (node, next) {
 $(node)
 .hide()
 .insertBefore(next)
 .slideDown();
 },
 removeElement: function (node) {
 $(node).slideUp(function () {
 $(this).remove();
 });
 }
 }
 });
 */

Template.account.helpers({
  //showAddAccount: function () {
  //  return Session.get('showAddAccount');
  //},
  isAdmin: function () {
    var grade = Meteor.users.findOne(Meteor.userId());
    console.log('account grade: ' + grade.grade);
    return grade && grade.grade == 3;
    //return account[0].grade == 3;
  }
});

Template.account.onCreated(function () {
  Session.set('accountSubmitErrors', {});
  //Session.set('showAddAccount', false);
});

Template.account.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.account-keyword').val(key);
  var target = $('#add-account');
  target.hide();
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
    // 清除有可能残留的出错信息
    Session.set('accountSubmitErrors', {});

    var target = t.$('#add-account');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function () {
          // 清空表单中填入的内容
          clearForm(target);
          target.addClass('hidden');
        });
      }
    }
  },

  'click .update-account': function (e, t) {
    e.preventDefault();
    // 清除有可能残留的出错信息
    Session.set('accountSubmitErrors', {});

    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-account');

    // 如果当前已经显示表单编辑框，则直接填入待更新数据
    if (form.hasClass('hidden')) {
      form.removeClass('hidden');
      form.slideDown('fast');
    }
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    form.find('[name=overlap]').val(_id);
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
      username: $.trim(form.find('[name=username]').val()),
      nickname: $.trim(form.find('[name=nickname]').val()),
      email: $.trim(form.find('[name=email]').val()),
      password: $.trim(form.find('[name=password]').val()),
      disabled: form.find('[name=disabled]').val(),
      stationId: form.find('[name=stationId]').val(),
      grade: parseFloat(form.find('[name=grade]').val()),
      comment: form.find('[name=comment]').val()
    };
    var passwordAgain = $.trim(form.find('[name=password-again]').val());
    if (passwordAgain != account.password) {
      //alert('两次输入的密码不一致');
      // 不提交，直接返回编辑界面
      //return;
      return throwError('两次输入的密码不一致');
    }

    // 修复内容为未定义的属性（当以非管理员用户登录时）
    if (account.disabled === undefined) {
      account.disabled = '';
    }
    if (account.stationId === undefined) {
      account.stationId = '';
    }
    if (account.grade === undefined) {
      account.grade = '';
    }

    //console.log('account: ' + JSON.stringify(account));
    var overlap = form.find('[name=overlap]').val();
    //console.log('overlap is: ' + overlap);

    var data = {account: account, overlap: overlap};
    var errors = validateAccount(data);
    if (errors.err) {
      //console.log('errors: ' + JSON.stringify(errors));
      Session.set('accountSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }

    Meteor.call('accountInsert', data, function (err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('accountSubmitErrors', {});
      var form = $('#add-account');
      // 清除表单的内容
      clearForm(form);
      // 隐藏表单
      form.slideUp('fast', function () {
        form.addClass('hidden');
      });
    });
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
