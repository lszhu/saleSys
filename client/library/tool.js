Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
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
  //return Session.get('defaultStationId') || '';
  //var stationId = Session.get('defaultStationId');
  //if (stationId) {
  //  return stationId;
  //}
  //var item = Stations && Stations.findOne();
  //return item && item._id;
};