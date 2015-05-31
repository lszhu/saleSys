Template.currencySelect.helpers({
  currencies: function() {
    return Currencies.find({}, {sort: {symbol: 1}});
  }
});

Template.currencySelectItem.helpers({
  // 判断是否为人民币
  isCNY: function() {
    return this.symbol == 'CNY';
  },

  // todo 需要根据登录用户的偏好设置来确定
  isDefaultCurrency: function() {
    return this.isCNY();
  }
});