// Write your package code here!
// Fixture data, used for test only
if (Meteor.isServer) {
  Meteor.startup(function () {
    //var Posts = new Mongo.Collection('posts');
    //var Comments = new Mongo.Collection('comments');
    console.log('\n\nPreparing test data...');

    // 添加测试使用的销售分部（station）数据库条目
    stationTestDataAdd();
    // 添加测试用的系统登录账号
    accountTestDataAdd();
    // 添加世界常见货币信息
    currencyTestDataAdd();
    // 添加测试用的内部员工信息
    employeeTestDataAdd();
    // 添加测试用的客户信息
    customerTestDataAdd();
    // 添加测试用的产品型号信息
    productTestDataAdd();
    // 添加测试用的订单信息
    orderTestDataAdd();

    /*
    if (Posts.find().count() === 0) {
      console.log('inserting test data to database');
      var now = new Date().getTime();

      // create two users
      var tomId = Meteor.users.insert({
        profile: {name: 'Tom Coleman'}
      });
      var tom = Meteor.users.findOne(tomId);
      var sachaId = Meteor.users.insert({
        profile: {name: 'Sacha Greif'}
      });
      var sacha = Meteor.users.findOne(sachaId);

      var telescopeId = Posts.insert({
        title: 'Introducing Telescope',
        userId: sacha._id,
        author: sacha.profile.name,
        url: 'http://sachagreif.com/introducing-telescope/',
        submitted: new Date(now - 7 * 3600 * 1000),
        commentsCount: 2,
        upvoters: [], votes: 0
      });

      Comments.insert({
        postId: telescopeId,
        userId: tom._id,
        author: tom.profile.name,
        submitted: new Date(now - 5 * 3600 * 1000),
        body: 'Interesting project Sacha, can I get involved?'
      });

      Comments.insert({
        postId: telescopeId,
        userId: sacha._id,
        author: sacha.profile.name,
        submitted: new Date(now - 3 * 3600 * 1000),
        body: 'You sure can Tom!'
      });

      Posts.insert({
        title: 'Meteor',
        userId: tom._id,
        author: tom.profile.name,
        url: 'http://meteor.com',
        submitted: new Date(now - 10 * 3600 * 1000),
        commentsCount: 0,
        upvoters: [], votes: 0
      });

      Posts.insert({
        title: 'The Meteor Book',
        userId: tom._id,
        author: tom.profile.name,
        url: 'http://themeteorbook.com',
        submitted: new Date(now - 12 * 3600 * 1000),
        commentsCount: 0,
        upvoters: [], votes: 0
      });

      for (var i = 0; i < 10; i++) {
        Posts.insert({
          title: 'Test post #' + i,
          author: sacha.profile.name,
          userId: sacha._id,
          url: 'http://google.com/?q=test-' + i,
          submitted: new Date(now - i * 3600 * 1000 + 1),
          commentsCount: 0,
          upvoters: [], votes: 0
        });
      }
    }
    */

    Meteor.setTimeout(function() {
      console.log('test data is ready!');
    }, 1000);
  });
}
