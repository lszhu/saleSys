// 系统账号配置
Accounts.config({
  // 禁止直接从客户端调用createUser创建登录账号
  // 同时不再提供Accounts.ui的创建账号的链接
  forbidClientAccountCreation: true
});

// 配置文件上传功能支持包
Meteor.startup(function() {
  var setting = Meteor.settings;
  var path = Npm.require('path');
  var store = process.cwd();
  console.log('root dir: ' + store);
  console.log('concat path: ' + path.join(store, '临时'));
  var voucherDir = setting && setting.voucherDir;
  voucherDir = voucherDir || {storeDir: '/upload', tmpDir: '/upload/tmp'};
  UploadServer.init({
    tmpDir: voucherDir.tmpDir,
    uploadDir: voucherDir.storeDir,
    checkCreateDirectories: true,   //create the directories for you
    getDirectory: function(fileInfo, formData) {
      console.log('file info: ' + JSON.stringify(fileInfo));
      console.log('form data: ' + JSON.stringify(formData));
      return '订单凭证';
    },
    finished: function(filename) {
      console.log('file name: ' + JSON.stringify(filename));
    }
  });
});