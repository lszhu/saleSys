Template.notFound.onCreated(function() {
  // 如果当前未登录（由cookie是否设置为loggedIn确定）
  if (document.cookie.search('loginStatus=Out') == -1) {
    Router.go('accessDenied');
  }
});