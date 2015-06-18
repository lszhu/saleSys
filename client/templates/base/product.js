Template.addProduct.helpers({
  hasError: function(field) {
    return !!Session.get('productSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.product.onCreated(function() {
  Session.set('productSubmitErrors', {});
});

Template.product.onRendered(function () {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.product-keyword').val(key);
  var target = $('#add-product');
  target.hide();
});

Template.product.events({
  'keypress .product-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.product-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-product': function (e) {
    e.preventDefault();
    var keyword = $('.product-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-product': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('productSubmitErrors', {});
    var target = $('#add-product');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      if (target.hasClass('hidden')) {
        target.removeClass('hidden');
        target.slideDown('fast');
      } else {
        target.slideUp('fast', function() {
          target.addClass('hidden');
          clearForm(target);
        });
      }
    }
  },

  'click .update-product': function (e) {
    e.preventDefault();
    // 清空可能遗留的错误信息
    Session.set('productSubmitErrors', {});
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    var form = $('#add-product');
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    form.find('[name=overlap]').val(_id);
    // 显示编辑框
    if (form.hasClass('hidden')) {
      form.removeClass('hidden');
      form.slideDown('fast');
    }
    // 将带更改数据填入表单
    fillForm(_id);
  },

  'click .remove-product': function (e) {
    e.preventDefault();
    if (!confirm('你确实要删除该销售分部的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('productRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-product').find('[name=overlap]').val('');
  },

  'submit .add-product': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var product = {
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
    console.log('product: ' + JSON.stringify(product));
    var overlap = form.find('[name=overlap]').val();
    console.log('overlap is: ' + overlap);
    var data = {product: product, overlap: overlap};
    var errors = validateProduct(data);
    if (errors.err) {
      Session.set('productSubmitErrors', errors);
      throwError(getErrorMessage(errors));
      return;
    }
    Meteor.call('productInsert', data, function(err) {
      if (err) {
        return throwError(err.reason);
      }

      // 清除可能遗留的错误信息
      Session.set('productSubmitErrors', {});
      var form = $('#add-product');
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
  var data = Products.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-product');
  form.find('[name=code]').val(data.code);
  form.find('[name=name]').val(data.name);
  form.find('[name=model]').val(data.model);
  form.find('[name=batch]').val(data.batch);
  form.find('[name=priceValue]').val(data.price.value);
  form.find('[name=currency]').val(data.price.currency);
  form.find('[name=comment]').val(data.comment);
  form.find('[name=memo]').val(data.memo);
}