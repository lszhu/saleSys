Template.currencySelect.helpers({
  currencies: function() {
    return Currencies.find({}, {sort: {symbol: 1}});
  }
});

Template.currencySelectItem.helpers({
  // 确定是否为当前默认的货币类型
  isDefaultCurrency: function() {
    return this.symbol == defaultCurrency();
  }
});