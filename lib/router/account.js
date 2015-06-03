// 销售分部管理路由控制器
AccountAdminController = RouteController.extend({
  template: 'account',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.accounts().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.accountAdmin
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
    this.accountsSubscribe = Meteor
        .subscribe('accounts', this.filterKey(), this.findOptions());
  },
  accounts: function () {
    //var selector = {};
    //if (this.filterKey()) {
    //  var key = new RegExp(this.filterKey(), 'i');
    //  selector = {
    //    $or: [{code: key}, {name: key}, {manager: key},
    //      {address: key}, {comment: key}, {memo: key}]
    //  };
    //}
    //return Accounts.find(selector, this.findOptions());
    return Users.find();
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      accounts: self.accounts(),
      itemCount: self.itemCount(),
      ready: self.accountsSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
