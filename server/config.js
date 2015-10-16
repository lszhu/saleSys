// 系统账号配置
Accounts.config({
  // 登录有大约1小时（0.04*24*60分钟）后自动退出
  // 每次重新打开浏览器时需要重新登陆
  // 同时会导致刷新页面时需要重新登陆
  //loginExpirationInDays: -0.04,

  // 禁止直接从客户端调用createUser创建登录账号
  // 同时不再提供Accounts.ui的创建账号的链接
  forbidClientAccountCreation: true
});

// 程序启动时的初始化操作
Meteor.startup(function() {
  // 初始化系统管理账号
  initAccount(Meteor.settings.initAccount);
  // 配置文件上传功能支持包
  uploadVoucher();
});

//initAccount(Meteor.settings.initAccount);

// 根据传入参数，形如{username: 'admin', password: 'admin'}在数据库中建立账号
// 如果未指定对应参数或属性，则默认为'admin'
function initAccount(acc) {
  // 如果系统中已存在系统管理员级别的账号则直接返回
  if (Meteor.users.findOne({grade: 3})) {
    console.log('Administrator account exists');
    return;
  } else {
    console.log('Trying to create a administrator account');
  }
  var a = acc ? acc : {username: 'admin', password: 'admin'};
  a.username = a.username ? a.username : 'admin';
  a.password = a.password ? a.password : 'admin';
  // 如果已存在相同用户名的账号则不做任何改动
  if (Meteor.users.findOne({username: a.username})) {
    return;
  }
  a.profile = {name: a.username};
  Accounts.createUser(a);
  // 将用户设置为系统管理员
  Meteor.users.update({username: a.username},
      {$set: {grade: 3, comment: '初始化自动生成'}});
  var user = Meteor.users.findOne({username: a.username});
  //console.log('root: ' + JSON.stringify(user));
  if (!user || user.grade != 3) {
    console.log('Can not create initial account, restart please!');
  }
}
