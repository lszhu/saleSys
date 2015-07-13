// 消息管理路由控制器
MessageAppController = RouteController.extend({
  template: 'message',
  increment: 5,
  sort: {timestamp: -1, read: 1, priority: -1},
  itemCount: function () {
    return this.messages().count();
  },
  nextPath: function () {
    if (this.itemCount() === this.itemLimit()) {
      var key = this.filterKey();
      key = key ? '?keyword=' + key : '';
      var self = this;
      return Router.routes.messageApp
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
    this.messagesSubscribe = Meteor
        .subscribe('messages', this.filterKey(), this.findOptions());
    return Meteor
        .subscribe('stations', '', {fields: {name: 1}, sort: {code: 1}});
  },
  messages: function () {
    //var selector = {};
    //if (this.filterKey()) {
    //  var key = new RegExp(this.filterKey(), 'i');
    //var selector = {
    //  $or: [{code: key}, {name: key}, {sex: key}, {title: key},
    //    {phone: key}, {email: key}, {'salary.value': key},
    //    {'salary.currency': key}, {memo: key}]
    //};
    //}
    //return Messages.find(selector, this.findOptions());
    return Messages.find();
  },
  data: function () {
    var self = this;
    return {
      filterKey: self.filterKey(),
      messages: self.messages(),
      itemCount: self.itemCount(),
      ready: self.messagesSubscribe.ready,
      nextPath: self.nextPath()
    };
  }
});
