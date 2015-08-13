uploadVoucher = function() {
  var setting = Meteor.settings;
  //var path = Npm.require('path');
  //var store = process.cwd();
  //console.log('root dir: ' + store);
  //console.log('concat path: ' + path.join(store, '临时'));
  var voucherDir = setting && setting.voucherDir;
  voucherDir = voucherDir || {storeDir: '/upload', tmpDir: '/upload/tmp'};
  UploadServer.init({
    tmpDir: voucherDir.tmpDir,
    uploadDir: voucherDir.storeDir,
    checkCreateDirectories: true,   //create the directories for you
    validateRequest: function(req) {
      var user = this.userId;
      console.log('user name: ' + user);
      return !!user;
    },
    getDirectory: function(fileInfo, formData) {
      var subPath = formData && formData.subPath;
      //console.log('sub path: ' + JSON.stringify(subPath));
      return subPath || 'error';
    },
    finished: function(filename, voucherInfo) {
      var data = _.omit(voucherInfo, 'subPath');
      data.path = filename && filename.path;
      console.log('data: ' + JSON.stringify(data));
      Meteor.call('orderVoucherAdd', data);
    }
  });
};
