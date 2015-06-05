// 系统账号配置
Accounts.config({
  // 禁止直接从客户端调用createUser创建登录账号
  // 同时不再提供Accounts.ui的创建账号的链接
  //forbidClientAccountCreation: true
});

// 用户账号登录界面配置（对应{{> loginButtons}}）
Accounts.ui.config({
  // 除密码栏外，登录登录需提供的信息仅包括用户名
  passwordSignupFields: 'USERNAME_ONLY'
});


/////////////////////////////////////////////////
// 以下为添加的第三方代码组件的配置
////////////////////////////////////////////////

// 配置用户登录组件界面为中文
accountsUIBootstrap3.setLanguage('zh');