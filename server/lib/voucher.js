uploadVoucher = function() {
  var setting = Meteor.settings;
  var path = Npm.require('path');
  //var store = process.cwd();
  //console.log('root dir: ' + store);
  //console.log('concat path: ' + path.join(store, '临时'));
  var voucherDir = setting && setting.voucherDir;
  voucherDir = voucherDir || {
        uploadDir: '/upload', tmpDir: '/upload/tmp', storeDir: '/voucher'
      };
  UploadServer.init({
    tmpDir: voucherDir.tmpDir,
    uploadDir: voucherDir.uploadDir,
    checkCreateDirectories: true,   //create the directories for you
    validateRequest: function(req) {
      var user = this.userId;
      console.log('user name: ' + user);
      return !!user;
    },
    getFileName: function(fileInfo, formData) {
      var t = new Date();
      var d = t.getDate();
      d = d < 10 ? '0' + d : d;
      var h = t.getHours();
      h = h < 10 ? '0' + h : h;
      var m = t.getMinutes();
      m = m < 10 ? '0' + m : m;
      var s = t.getSeconds();
      s = s < 10 ? '0' + s : s;
      var random = randAlpha(3);
      var ext = path.extname(fileInfo.name);
      return formData.subPath + d + h + m + s + random + ext;
    },
    /*
    getDirectory: function(fileInfo, formData) {
      var subPath = formData && formData.subPath;
      //console.log('sub path: ' + JSON.stringify(subPath));
      return subPath || 'error';
    },
    */
    finished: function(filename, voucherInfo) {
      var path = Npm.require('path');
      var fs = Npm.require('fs');
      console.log('filename: ', filename);
      console.log('voucherInfo: ', voucherInfo);

      var storeDir = voucherDir.storeDir;
      var uploadDir =voucherDir.uploadDir;
      storeDir = path.join(storeDir, voucherInfo.subPath);
      var data = _.omit(voucherInfo, 'subPath');
      data.path = filename && filename.path;
      // 去掉前导斜杠
      if (data.path[0] == '/') {
        data.path = data.path.slice(1);
      }
      console.log('data: ' + JSON.stringify(data));

      // 将上传的文件移动到响应目录中
      fs.stat(storeDir, function(err, stats) {
        if (err) {
          if (err.code != 'ENOENT') {
            console.log('save uploaded voucher error');
            return;
          }
          fs.mkdir(storeDir, function(err) {
            if (err) {
              console.log('save uploaded voucher error');
              return;
            }
            fs.rename(path.join(uploadDir, filename.name),
                path.join(storeDir, filename.name));
            //Meteor.call('orderVoucherAdd', data);
          });
        } else if (stats.isDirectory()) {
          fs.rename(path.join(uploadDir, filename.name),
              path.join(storeDir, filename.name));
        } else {
          console.log('illegal path for saving voucher files');
        }
      });
      Meteor.call('orderVoucherAdd', data);
    }
  });
};
