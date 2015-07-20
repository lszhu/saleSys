// 销售分部管理路由控制器
MonitorAdminController = RouteController.extend({
  template: 'monitor',
  increment: 5,
  sort: {username: 1, timestamp: -1},
  itemCount: function () {
    return this.monitors().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.monitorAdmin
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
    this.monitorsSubscribe = Meteor
        .subscribe('monitors', this.filterKey(), this.findOptions());
    return [
      Meteor.subscribe('accounts', '', {sort: {timestamp: -1}}),
      Meteor.subscribe('stations', '', {fields: {name: 1}, sort: {code: 1}})
    ];
  },
  monitors: function () {
    //var key = new RegExp(this.filterKey(), 'i');
    return Monitors.find({}, this.findOptions());
    //return Meteor.users.find({grade: {$ne: undefined}});
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      monitors: self.monitors(),
      itemCount: self.itemCount(),
      ready: self.monitorsSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
