// 销售分部管理路由控制器
CustomerBaseController = RouteController.extend({
  template: 'customer',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.customers().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.customerBase
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
    this.customersSubscribe = Meteor
        .subscribe('customers', this.filterKey(), this.findOptions());
  },
  customers: function () {
    //var selector = {};
    //if (this.filterKey()) {
    //  var key = new RegExp(this.filterKey());
    //  selector = {
    //    $or: [{code: key}, {name: key}, {company: key}, {title: key},
    //      {phone: key}, {email: key}, {address: key}, {memo: key}]
    //  };
    //}
    //return Customers.find(selector, this.findOptions());
    return Customers.find();
  },
  data: function () {
    var self = this;
    return {
      customers: self.customers(),
      itemCount: self.itemCount(),
      ready: self.customersSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
