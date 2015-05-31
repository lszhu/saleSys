Template.currencySelect.helpers({
  currencies: function() {
    return Currencies.find({}, {sort: {symbol: 1}});
  }
});

Template.currencySelectItem.helpers({
  isCNY: function() {
    return this.symbol == 'CNY';
  }
});