// 添加测试使用的登录账号信息（Meteor.users）数据库条目，
accountTestDataAdd = function () {
  var data = [
    {
      username: 'user01',
      nickname: '张三',
      password: 'aaaaaa',
      grade: 3,
      email: 'zhangsan@asdf.com',
      comment: '代管仓库'
    },
    {
      username: 'user02',
      nickname: '李四',
      password: 'aaaaaa',
      grade: 2,
      email: 'lisi@asdf.com',
      comment: ''
    },
    {
      username: 'user03',
      nickname: '王五',
      password: 'aaaaaa',
      grade: 1,
      email: 'wangwu@asdf.com',
      comment: ''
    },
    {
      username: 'user04',
      nickname: '赵梅',
      password: 'bbbbbb',
      grade: 0,
      email: 'zhaomei@asdf.com',
      comment: ''
    },
    {
      username: 'user05',
      nickname: '李兰',
      password: 'bbbbbb',
      grade: 3,
      email: 'qianlan@asdf.com',
      comment: '负责文书'
    },
    {
      username: 'user06',
      nickname: '周黄河',
      password: 'aaaaaa',
      grade: 2,
      email: 'zhouhuanghe@asdf.com',
      comment: ''
    },
    {
      username: 'user07',
      nickname: '陈秋菊',
      password: 'bbbbbb',
      grade: 1,
      email: 'chenqiuju@asdf.com',
      comment: ''
    },
    {
      username: 'user08',
      nickname: '刘自在',
      password: 'aaaaaa',
      grade: 0,
      email: 'liuzizai@asdf.com',
      comment: '负责东北片区'
    },
    {
      username: 'user09',
      nickname: '张长江',
      password: 'aaaaaa',
      grade: 1,
      email: 'zhangchangjiang@asdf.com',
      disabled: true,
      comment: '同时负责送货'
    }
  ];
  var count = Meteor.users.find().count();
  if (count != 0) {
    return;
  }
  var station = Stations.find().fetch();
  var len = station.length;
  var userId;
  for (var i = 0; i < data.length; i++) {
    userId = Accounts.createUser(data[i]);
    data[i].stationId = station[Math.floor(len * Math.random())]._id;
    data[i].profile = {
      name: data[i].nickname,
      currency: 'CNY',
      stationId: data[i].stationId
    };
    //console.log('_id: ' + data[i].stationId);
    data[i] = _.omit(data[i], ['username', 'password', 'email', 'nickname']);
    Meteor.users.update(userId, {$set: data[i]});
  }
};