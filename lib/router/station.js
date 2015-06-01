// 销售分部管理路由控制器
StationAdminController = RouteController.extend({
  template: 'station',
  increment: 5,
  sort: {code: 1, name: 1, timestamp: 1},
  itemCount: function () {
    return this.stations().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.stationAdmin
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
    this.stationsSubscribe = Meteor
        .subscribe('stations', this.filterKey(), this.findOptions());
  },
  stations: function () {
    var selector = {};
    if (this.filterKey()) {
      var key = new RegExp(this.filterKey(), 'i');
      selector = {
        $or: [{code: key}, {name: key}, {manager: key},
          {address: key}, {comment: key}, {memo: key}]
      };
    }
    return Stations.find(selector, this.findOptions());
  },
  data: function () {
    var self = this;
    return {
      stations: self.stations(),
      itemCount: self.itemCount(),
      ready: self.stationsSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
