// 销售分部管理路由控制器
ProductBaseController = RouteController.extend({
  template: 'product',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.products().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.productBase
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
    this.productsSubscribe = Meteor
        .subscribe('products', this.filterKey(), this.findOptions());
  },
  products: function () {
    //var selector = {};
    //if (this.filterKey()) {
    //  var key = new RegExp(this.filterKey(), 'i');
    //  selector = {
    //    $or: [{code: key}, {name: key}, {manager: key},
    //      {address: key}, {comment: key}, {memo: key}]
    //  };
    //}
    //return Products.find(selector, this.findOptions());
    return Products.find();
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      products: self.products(),
      itemCount: self.itemCount(),
      ready: self.productsSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
