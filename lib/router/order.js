// 订单管理路由控制器
OrderManagementController = RouteController.extend({
  template: 'orderManagement',
  increment: 5,
  sort: {timestamp: -1, code: -1},
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
    return query && query.keyword ? query.keyword : '';
  },
  subscriptions: function () {
    this.ordersSubscribe = Meteor
        .subscribe('orders', this.filterKey(), this.findOptions());
    var option = {fields: {name: 1, code: 1}, sort: {code: 1}};
    return [
      Meteor.subscribe('stations', '', option),
      Meteor.subscribe('customers', '', option)
    ];
  },
  orders: function () {
    var selector = {};
    return Orders.find(selector, this.findOptions());
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

// 订单处理路由控制器
OrderDisposalController = RouteController.extend({
  template: 'orderDisposal',
  sort: {timestamp: -1, code: -1},
  findOptions: function () {
    var self = this;
    return {sort: self.sort};
  },
  subscriptions: function () {
    this.ordersSubscribe = Meteor
        .subscribe('orders', '', this.findOptions());
    var option = {fields: {name: 1, code: 1}, sort: {code: 1}};
    return [
      Meteor.subscribe('stations', '', option),
      Meteor.subscribe('customers', '', option)
    ];
  },
  orders: function () {
    var selector = this.params.item;
    // todo change find to findOne
    return Orders.find(selector, this.findOptions());
  },
  data: function () {
    var self = this;
    return {
      orders: self.orders(),
      ready: self.ordersSubscribe.ready
    };
  }
});