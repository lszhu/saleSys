Template.addCurrency.helpers({
  hasError: function (field) {
    return !!Session.get('currencySubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.currency.onCreated(function() {
  Session.set('currencySubmitErrors', {});
});

Template.currency.onRendered(function() {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.currency-keyword').val(key);
  var target = $('#add-currency');
  target.hide();
});

Template.currency.events({
  'keypress .currency-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.currency-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.currency-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-currency': function (e) {
    e.preventDefault();
    var keyword = $('.currency-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-currency': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('currencySubmitErrors', {});
    var target = $('#add-currency');
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

  'click .update-currency': function(e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('currencySubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    var form = $('#add-currency');
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

  'click .remove-currency': function(e) {
    e.preventDefault();
    if (!confirm('你确实要删除该货币信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('currencyRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-currency').find('[name=overlap]').val('');
  },

  'submit .add-currency': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var rate = form.find('[name=rate]').val();
    rate = parseFloat(rate) ? parseFloat(rate) : 0;
    var currency = {
      symbol: form.find('[name=symbol]').val(),
      name: form.find('[name=name]').val(),
      country: form.find('[name=country]').val(),
      rate: rate,
      memo: form.find('[name=memo]').val()
    };
    console.log('currency: ' + JSON.stringify(currency));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {currency: currency, overlap: overlap};
    var errors = validateCurrency(data);
    if (errors.err) {
      Session.set('currencySubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('currencyInsert', data, function(err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('currencySubmitErrors', {});
      var form = $('#add-currency');
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
  form.find('[name=symbol]').val('');
  form.find('[name=name]').val('');
  form.find('[name=country]').val('');
  form.find('[name=rate]').val('');
  form.find('[name=memo]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Currencies.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-currency');
  form.find('[name=symbol]').val(data.symbol);
  form.find('[name=name]').val(data.name);
  form.find('[name=country]').val(data.country);
  form.find('[name=rate]').val(data.rate);
  form.find('[name=memo]').val(data.memo);
}