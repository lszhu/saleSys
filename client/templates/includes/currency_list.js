Template.currencySelect.helpers({
  currencies: function() {
    return Currencies.find({}, {sort: {symbol: 1}});
  }
});

Template.currencySelectItem.helpers({
  // 确定是否为当前默认的货币类型
  isDefaultCurrency: function() {
    return this.symbol == defaultCurrency();
  },
  // 如果特别指定了货币，则选中指定货币，否则选中默认货币
  isSelected: function() {
    var data = Template.parentData();
    console.log('selected currency: ' + data && data.selection);
    if (data && data.selection) {
      return this.symbol == data.selection;
    } else {
      return this.symbol == defaultCurrency();
    }
    return false;
  }
});