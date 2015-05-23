// 包的基本信息
Package.describe({
  name: 'fixtures',
  version: '0.1.0',
  debugOnly: true,
  // Brief, one-line summary of the package.
  summary: '用于向数据库中插入测试数据，不会包含于正式部署的项目中',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

// 定义包的基本组成，比如依赖关系和导出内容
Package.onUse(function(api) {
  // meteor的最低支持版本
  api.versionsFrom('1.1.0.2');
  // 指定依赖的包列表，及代码执行的位置（client还是server）
  api.use('mongo');
  //api.use(['mongo', 'ddp', 'meteor', 'deps', 'livedata', 'underscore'], 'server');
  // 定义包的源代码所在文件
  api.addFiles('fixtures.js', 'server');
});

/*
Package.onTest(function(api) {
  api.use('tinytest');
  api.use('fixtures');
  api.addFiles('fixtures-tests.js');
});
*/
