// 销售分部管理路由控制器
PrivilegeAdminController = RouteController.extend({
  template: 'privilege',
  increment: 5,
  sort: {username: 1, timestamp: 1},
  itemCount: function () {
    return this.privileges().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.privilegeAdmin
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
    this.privilegesSubscribe = Meteor
        .subscribe('privileges', this.filterKey(), this.findOptions());
    return Meteor
        .subscribe('stations', '', {fields: {name: 1}, sort: {code: 1}});
  },
  privileges: function () {

    var key = new RegExp(this.filterKey(), 'i');
    // 从销售分部collection中找到名称匹配关键字的销售分部对应_id
    var station = Stations.find({name: key}).fetch();
    //console.log('privileges publish, station: ' + JSON.stringify(station));
    station = station.map(function (e) {
      return e._id;
    });
    var selector = {
      $or: [
        {username: key}, {nickname: key}, {stationId: {$in: station}},
        {emails: {$elemMatch: {address: key}}}, {comment: key}
      ]
    };
    return Meteor.users.find(selector, this.findOptions());
    //return Meteor.users.find({grade: {$ne: undefined}});
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      privileges: self.privileges(),
      itemCount: self.itemCount(),
      ready: self.privilegesSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
