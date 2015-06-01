// 添加测试使用的内部员工信息（employee）数据库条目，
employeeTestDataAdd = function () {
  var data = [
    {
      code: 'e001',
      name: '张三',
      sex: '男',
      title: '业务代表',
      phone: '123435123',
      email: 'zhangsan@asdf.com',
      salary: {value: 5000, currency: 'CNY'},
      memo: '代管仓库'
    },
    {
      code: 'e002',
      name: '李四',
      sex: '男',
      title: '业务代表',
      phone: '163412123',
      email: 'lisi@asdf.com',
      salary: {value: 5500, currency: 'CNY'},
      memo: ''
    },
    {
      code: 'e003',
      name: '王五',
      sex: '男',
      title: '业务代表',
      phone: '13933435123',
      email: 'wangwu@asdf.com',
      salary: {value: 8000, currency: 'HKD'},
      memo: ''
    },
    {
      code: 'e004',
      name: '赵梅',
      sex: '女',
      title: '业务代表',
      phone: '13933435123',
      email: 'zhaomei@asdf.com',
      salary: {value: 3500, currency: 'USD'},
      memo: ''
    },
    {
      code: 'e005',
      name: '李兰',
      sex: '女',
      title: '业务代表',
      phone: '13972325123',
      email: 'qianlan@asdf.com',
      salary: {value: 4000, currency: 'CNY'},
      memo: '负责文书'
    },
    {
      code: 'e006',
      name: '周黄河',
      sex: '男',
      title: '业务代表',
      phone: '18078235123',
      email: 'zhouhuanghe@asdf.com',
      salary: {value: 5800, currency: 'CNY'},
      memo: ''
    },
    {
      code: 'e007',
      name: '陈秋菊',
      sex: '女',
      title: '前台',
      phone: '1337642533',
      email: 'chenqiuju@asdf.com',
      salary: {value: 3000, currency: 'CNY'},
      memo: ''
    },
    {
      code: 'e008',
      name: '刘自在',
      sex: '男',
      title: '业务经理',
      phone: '13564315123',
      email: 'liuzizai@asdf.com',
      salary: {value: 6000, currency: 'CNY'},
      memo: '负责东北片区'
    },
    {
      code: 'e009',
      name: '张长江',
      sex: '男',
      title: '司机',
      phone: '13964322453',
      email: 'zhangchangjiang@asdf.com',
      salary: {value: 4000, currency: 'CNY'},
      memo: '同时负责送货'
    }
  ];
  var count = Employees.find().count();
  if (count != 0) {
    return;
  }
  var station = Stations.find().fetch();
  var len = station.length;
  for (var i = 0; i < data.length; i++) {
    data[i].stationId = station[Math.floor(len * Math.random())]._id;
    //console.log('_id: ' + data[i].stationId);
    data[i].timestamp = new Date(2015, 3, 31 * Math.random());
    Employees.insert(data[i]);
  }
}
;