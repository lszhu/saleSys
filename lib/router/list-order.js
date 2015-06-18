// 销售分部管理路由控制器
OrderManagementController = RouteController.extend({
  template: 'orderManagement',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.orders().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.orderManagement
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
    this.ordersSubscribe = Meteor
        .subscribe('orders', this.filterKey(), this.findOptions());
    return Meteor
        .subscribe('stations', '', {fields: {name: 1}, sort: {code: 1}});
  },
  orders: function () {
    //var selector = {};
    //if (this.filterKey()) {
    //  var key = new RegExp(this.filterKey(), 'i');
    //var selector = {
    //  $or: [{code: key}, {name: key}, {sex: key}, {title: key},
    //    {phone: key}, {email: key}, {'salary.value': key},
    //    {'salary.currency': key}, {memo: key}]
    //};
    //}
    //return Orders.find(selector, this.findOptions());
    return Orders.find();
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      orders: self.orders(),
      itemCount: self.itemCount(),
      ready: self.ordersSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
