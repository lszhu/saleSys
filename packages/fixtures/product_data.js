// 添加测试使用的产品型号（product）数据库条目，
productTestDataAdd = function () {
  var data = [
    {
      code: 'p001',
      name: '三星手机',
      model: 'galaxy S6',
      batch: '',
      price: {value: 4800, currency: 'CNY'},
      comment: '三星电子',
      memo: ''
    },
    {
      code: 'p002',
      name: '三星手机',
      model: 'galaxy edge6',
      batch: '',
      price: {value: 5200, currency: 'CNY'},
      comment: '三星电子',
      memo: ''
    },
    {
      code: 'p003',
      name: '戴尔笔记本电脑',
      model: 'XPS 13',
      batch: '第四代',
      price: {value: 6800, currency: 'CNY'},
      comment: '三星电子',
      memo: ''
    },
    {
      code: 'p004',
      name: '戴尔笔记本电脑',
      model: 'XPS 13',
      batch: '第五代',
      price: {value: 8800, currency: 'CNY'},
      comment: '三星电子',
      memo: ''
    },
    {
      code: 'p005',
      name: '苹果iphone',
      model: 'iphone6',
      batch: '',
      price: {value: 4900, currency: 'CNY'},
      comment: '4.7寸',
      memo: '2014年下半年上市'
    },
    {
      code: 'p006',
      name: '苹果iphone',
      model: 'iphone6pro',
      batch: '',
      price: {value: 5300, currency: 'CNY'},
      comment: '5.3寸',
      memo: '2014年下半年上市'
    },
    {
      code: 'p007',
      name: '苹果ipad',
      model: 'ipad air2 64G',
      batch: '',
      price: {value: 4200, currency: 'CNY'},
      comment: '',
      memo: ''
    },
    {
      code: 'p008',
      name: '苹果ipad',
      model: 'ipad air2 128G',
      batch: '',
      price: {value: 699, currency: 'USD'},
      comment: '',
      memo: '美国境内'
    },
    {
      code: 'p009',
      name: '苹果ipad',
      model: 'ipad mini2 64G',
      batch: '',
      price: {value: 399, currency: 'USD'},
      comment: '',
      memo: '美国境内'
    },
    {
      code: 'p010',
      name: '苹果笔记本电脑',
      model: 'mac Book pro15',
      batch: '2014',
      price: {value: 14800, currency: 'HKD'},
      comment: 'i7五代 16GRam 500GHd Ati独显',
      memo: ''
    },
    {
      code: 'p011',
      name: '苹果笔记本电脑',
      model: 'mac Book 12',
      batch: '2015',
      price: {value: 9800, currency: 'HKD'},
      comment: '',
      memo: ''
    },
    {
      code: 'p012',
      name: '谷歌手机',
      model: 'Nexus 6',
      batch: '',
      price: {value: 699, currency: 'USD'},
      comment: '摩托罗拉代工',
      memo: ''
    }
  ];
  var count = Products.find().count();
  if (count != 0) {
    return;
  }
  for (var i = 0; i < data.length; i++) {
    data[i].timestamp = new Date(2015, 4, 31 * Math.random());
    Products.insert(data[i]);
  }
};