// 销售分部管理路由控制器
CurrencyBaseController = RouteController.extend({
  template: 'currency',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.currencies().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.currencyBase
              .path({itemLimit: self.itemLimit() + self.increment}) + key;
    }
  },
  itemLimit: function () {
    return parseInt(this.params.itemLimit) || this.increment;
  },
  findOptions: function () {
    var self = this;
    return {sort: self.sort, limit: self.itemLimit()};
  },
  filterKey: function () {
    var query = this.params.query;
    //console.log('query: ' + query.keyword);
    return query && query.keyword ? query.keyword : '';
  },
  subscriptions: function () {
    this.currenciesSubscribe = Meteor
        .subscribe('currencies', this.filterKey(), this.findOptions());
  },
  currencies: function () {
    var selector = {};
    if (this.filterKey()) {
      var key = new RegExp(this.filterKey(), 'i');
      selector = {
        $or: [{symbol: key}, {name: key}, {country: key},
          {rate: parseFloat(this.filterKey())}, {memo: key}]
      };
    }
    return Currencies.find(selector, this.findOptions());
  },
  data: function () {
    var self = this;
    return {
      currencies: self.currencies(),
      itemCount: self.itemCount(),
      ready: self.currenciesSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
