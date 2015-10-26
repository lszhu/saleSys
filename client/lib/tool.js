Template.registerHelper('pluralize', function (n, thing) {
  // fairly stupid pluralizer
  return n === 1 ? '1 ' + thing : n + ' ' + thing + 's';
});

// 获取默认货币类型，如果为设置，则设置人民币元（CNY）
defaultCurrency = function () {
  //return Session.get('defaultCurrency') || 'CNY';
  var user = Meteor.user();
  return user && user.profile.currency;
};

// 获取默认管理区域（可能为空，比如管理员账号）
defaultStationId = function () {
  var user = Meteor.user();
  return user && user.profile.stationId;
};

// 获取指定订单处理的货物列表相关联的HandsOnTable表格对象
getGoodsListHot = function (index) {
  var data = orderDisposalDetailGoodsLists[index];
  if (!data || !data.hot) {
    throwError('未找到货物列表');
    return null;
  }
  return data.hot;
};

// 清空整个保存各次订单处理的多个商品列表
clearOrderDisposalGoodsLists = function (index) {
  var n = parseInt(index);
  // 传递的参数为空值时清空所有数据
  if (isNaN(n)) {
    for (var i = 0, len = orderDisposalDetailGoodsLists.length; i < len; i++) {
      delete orderDisposalDetailGoodsLists[i];
    }
    orderDisposalDetailGoodsLists = [];
  }
  // 不能删除第一个成员，它对应添加新订单处理的商品列表
  if (n !== 0) {
    orderDisposalDetailGoodsLists.splice(n, 1);
  }
  //var len = orderDisposalDetailGoodsLists.length;
  //for (; n < len; n++) {
  //  orderDisposalDetailGoodsLists[n].hot.loadData(
  //      orderDisposalDetailGoodsLists[n].data
  //  );
  //  console.log('从新加载数据于%d号处理信息', n);
  //}
};

// 当删除某个订单处理后，对订单处理的承载的DOM进行调整以便正确显示
updateGoodsListForRemoval = function (index) {
  if (index <= 0) {
    return;
  }
  var grid = $('.goods-list > .grid');
  var len = grid && grid.length;
  for (var i = index; i < len; i++) {
    console.log('从新显示%d号处理的货物清单', i);
    grid.eq(i - 1).children().detach();
    grid.eq(i - 1).append(orderDisposalDetailGoodsLists[i].container);
    orderDisposalDetailGoodsLists[i].hot.loadData(
        orderDisposalDetailGoodsLists[i].data
    );
  }
};

// 将形如{_id: xx, name: xx, stationId: xx}的用户列表依照部门分类成二维数组
classifyReceivers = function (receivers) {
  if (!receivers || receivers.constructor.name != 'Array') {
    return [];
  }
  var stations = Stations.find().fetch();
  stations = _.indexBy(stations, '_id');
  //console.log('stations: ' + JSON.stringify(stations));
  receivers = _.groupBy(receivers, function (e) {
    return e.stationId;
  });
  //console.log('receivers: ' + JSON.stringify(receivers));
  var data = [];
  var name;
  for (var i in receivers) {
    if (!receivers.hasOwnProperty(i)) {
      return;
    }
    name = stations[i] ? station[i].name : '不属于任何部门';
    data.push({name: name, receivers: receivers[i]});
  }
  //console.log('end receivers: ' + JSON.stringify(data));
  return data;
};

getNameFromId = function (userId) {
  var receiverList = Session.get('receiverList');
  var user = receiverList && receiverList[userId];
  return user && user.name ? user.name : '未知';
};
