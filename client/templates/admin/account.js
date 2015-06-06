Template.accountListItem.helpers({
  email: function() {
    return this.emails && this.emails[0].address;
  },
  status: function() {
    return this.disabled ? '禁用' : '启用';
  },
  rightGrade: function() {
    var comments = ['受限', '普通', '特权', '管理'];
    return this.grade && comments[this.grade];
  }
});

Template.account.helpers({
  isAdmin: function () {
    var account = this.accounts && this.accounts.fetch();
    if (account && account.length != 1) {
      return true;
    }
    return account[0].type == 3;
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
      code: form.find('[name=code]').val(),
      name: form.find('[name=name]').val(),
      model: form.find('[name=model]').val(),
      batch: form.find('[name=batch]').val(),
      price: {
        value: parseFloat(form.find('[name=priceValue]').val()),
        currency: form.find('[name=currency]').val()
      },
      comment: form.find('[name=comment]').val(),
      memo: form.find('[name=memo]').val()
    };
    console.log('account: ' + JSON.stringify(account));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    Meteor.call('accountInsert', {account: account, overlap: overlap});
    // 最后清除表单的内容
    clearForm(e.target);
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=code]').val('');
  form.find('[name=name]').val('');
  form.find('[name=model]').val('');
  form.find('[name=batch]').val('');
  form.find('[name=priceValue]').val('');
  // 货币类型设置为默认货币
  console.log('default currency: ' + defaultCurrency());
  form.find('[name=currency]').val(defaultCurrency());
  form.find('[name=comment]').val('');
  form.find('[name=memo]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Meteor.users.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-account');
  form.find('[name=code]').val(data.code);
  form.find('[name=name]').val(data.name);
  form.find('[name=model]').val(data.model);
  form.find('[name=batch]').val(data.batch);
  form.find('[name=priceValue]').val(data.price.value);
  form.find('[name=currency]').val(data.price.currency);
  form.find('[name=comment]').val(data.comment);
  form.find('[name=memo]').val(data.memo);
}