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

Meteor.startup(function() {
  // 配置文件上传功能支持包
  uploadVoucher();
});