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
  return Session.get('defaultCurrency') || 'CNY';
};

// 获取默认管理区域，如果为设置，则选择选择系统中最早出现的区域
defaultStationId = function() {
  var stationId = Session.get('defaultStationId');
  if (stationId) {
    return stationId;
  }
  return Stations && Stations.findOne()._id;
};