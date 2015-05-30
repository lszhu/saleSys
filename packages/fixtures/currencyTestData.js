// 添加测试使用的流行的世界各国货币（currency）数据库条目，
currencyTestDataAdd = function() {
  var data = [
    {name: '人民币元', symbol: 'CNY', rate: 6.2, country: '中国', memo: '默认'},
    {name: '美元', symbol: 'USD', rate: 1, country: '美国', memo: '通用货币'},
    {name: '欧元', symbol: 'EUR', rate: 0.75, country: '欧洲', memo: '欧洲通用'},
    {name: '港币', symbol: 'HKD', rate: 7.8, country: '中国香港'},
    {name: '日圆', symbol: 'JPY', rate: 100, country: '日本'}
  ];
  var count = Currencies.find().count();
  if (count != 0) {
    return;
  }
  for (var i = 0; i < data.length; i++) {
    data[i].timestamp = new Date(2015, 3, 31 * Math.random());
    Currencies.insert(data[i]);
  }
};