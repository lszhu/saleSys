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