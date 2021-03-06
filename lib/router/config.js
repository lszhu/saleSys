Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return [
      Meteor.subscribe('messages', {read: false}, {sort: {timestamp: -1}}),
      Meteor.subscribe('currencies', '', {})];
  }
});

// 进入系统前必须登录
var requireLogin = function () {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      //this.render('accessDenied');
      Router.go('/accessDenied');
    }
  } else {
    this.next();
  }
};

// 根据系统是否已有账号判断，决定是否进入系统账号初始化界面
var initAccount = function () {
  if (Meteor.user()) {
    this.next();
  } else if (Meteor.loggingIn()) {
    this.render(this.loadingTemplate);
  } else {
    this.next();
  }
};

//Router.onBeforeAction('dataNotFound', {only: 'postPage'});
//Router.onBeforeAction(requireLogin, {only: 'postSubmit'});

// 仅用于客户端路由
if (Meteor.isClient) {
  // 展示login, accessDenied, accountAdmin等页面时不需要预先登录
  Router.onBeforeAction(requireLogin,
      {except: ['login', 'accessDenied', 'accountAdmin']});

  // 当系统无任何账号时，如果进入账号管理，将可以添加系统管理员账号
  // 而如果系统已经有账号时，如果未经登录而进入账号管理，将显示出错信息
  Router.onBeforeAction(initAccount, {only: 'accountAdmin'});
}
// 订单基本信息管理与查询
Router.route('/orderManagement/:itemLimit?', {name: 'orderManagement'});
// 订单处理
Router.route('/order/:item?', {name: 'orderDisposal'});

// 登录页面，并清除默认的布局模板
Router.route('/login', {name: 'login', layoutTemplate: ''});

// 显示禁止访问页面，并清除默认的布局模板
Router.route('/accessDenied', {name: 'accessDenied', layoutTemplate: ''});

// 消息管理
Router.route('/messageApp/:itemLimit?', {name: 'messageApp'});
// 出入库管理
Router.route('/deliveryApp/:itemLimit?', {name: 'deliveryApp'});
// 资金收支管理
Router.route('/capitalApp/:itemLimit?', {name: 'capitalApp'});

// 客户名单管理
Router.route('/customerBase/:itemLimit?', {name: 'customerBase'});
// 员工名单管理
Router.route('/employeeBase/:itemLimit?', {name: 'employeeBase'});
// 产品型号管理
Router.route('/productBase/:itemLimit?', {name: 'productBase'});
// 货币类型管理
Router.route('/currencyBase/:itemLimit?', {name: 'currencyBase'});

// 库存汇总表
Router.route('/storeTable/:itemLimit?', {name: 'storeTable'});
// 不良品分析
Router.route('/rejectTable/:itemLimit?', {name: 'rejectTable'});
// 资金汇总表
Router.route('/capitalTable/:itemLimit?', {name: 'capitalTable'});
// 付款进度表
Router.route('/paymentTable/:itemLimit?', {name: 'paymentTable'});
// 订单汇总表
Router.route('/orderTable/:itemLimit?', {name: 'orderTable'});

// 销售分部管理
Router.route('/stationAdmin/:itemLimit?', {name: 'stationAdmin'});
// 登录账号管理
Router.route('/accountAdmin/:itemLimit?', {name: 'accountAdmin'});
// 自动消息配置管理
Router.route('/monitorAdmin/:itemLimit?', {name: 'monitorAdmin'});
// 用户权限配置管理
Router.route('/privilegeAdmin/:itemLimit?', {name: 'privilegeAdmin'});

// 登录后进入的欢迎界面
Router.route('/', {name: 'welcome'});

// 服务器端路由，用于显示凭证图片
Router.route('/server/voucher', {where: 'server'}).get(function() {
  console.log('try to get vouchers', Orders.find().count());
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var url = Npm.require('url');
  var queryString = Npm.require('querystring');
  var res = this.response;

  var query = url.parse(this.request.url)['query'];
  query = queryString.parse(query);
  console.log('request url query : ', query);

  if (!Orders.findOne(query.hash)) {
    console.log('试图读取凭证文件时，未提供校验信息');
    return res.end('非法访问');
  }

  var setting = Meteor.settings;
  var voucherDir = setting && setting.voucherDir;
  var storeDir = voucherDir ? voucherDir.storeDir : '/store';
  //console.log('response: ', Object.keys(this.response));
  var file = path.join(storeDir, query.name);
  var contentType = getContentType(path.extname(file));
  console.log('file is ', file);
  fs.readFile(file, function(err, data) {
    if (err) {
      res.end('因文件读取错误，无法获取有效凭证文件数据');
      return;
    }
    res.writeHead(200, {'Content-Type': contentType});
    res.end(data);
  });
});


/////////////////////////////////////////////////////////
// 以下内容仅为示例，正式版将删除

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 2,
  postsLimit: function () {
    return parseInt(this.params.postsLimit) || this.increment;
  },
  findOptions: function () {
    return {sort: this.sort, limit: this.postsLimit()};
  },
  subscriptions: function () {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function () {
    return Posts.find({}, this.findOptions());
  },
  data: function () {
    var self = this;
    return {
      posts: self.posts(),
      ready: self.postsSub.ready,
      nextPath: function () {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function () {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function () {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

//Router.route('/', {
//  name: 'home',
//  controller: NewPostsController
//});

Router.route('/new/:postsLimit?', {name: 'newPosts'});

Router.route('/best/:postsLimit?', {name: 'bestPosts'});


Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function () {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function () {
    return Posts.findOne(this.params._id);
  }
});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function () {
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function () {
    return Posts.findOne(this.params._id);
  }
});

Router.route('/submit', {name: 'postSubmit'});

