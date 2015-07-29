// 销售分部雇员管理路由控制器
RejectTableController = RouteController.extend({
  template: 'rejectTable',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return 5;
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.rejectTable
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
  subscriptions: function () {
    return Meteor
        .subscribe('stations', '', {fields: {name: 1}, sort: {code: 1}});
  },
  filterKey: function () {
    var query = this.params.query;
    //console.log('query: ' + query.keyword);
    return query && query.keyword ? query.keyword : '';
  },

  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      itemCount: self.itemCount(),
      nextPath: self.nextPath()
    };
  }
});
