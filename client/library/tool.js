Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  return n === 1 ? '1 ' + thing : n + ' ' + thing + 's';
});

// 获取默认货币类型，如果为设置，则设置人民币元（CNY）
defaultCurrency = function() {
  //return Session.get('defaultCurrency') || 'CNY';
  var user = Meteor.user();
  return user && user.profile.currency;
};

// 获取默认管理区域（可能为空，比如管理员账号）
defaultStationId = function() {
  var user = Meteor.user();
  return user && user.profile.stationId;
};
