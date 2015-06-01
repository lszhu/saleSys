// 添加测试使用的销售分部（station）数据库条目，
stationTestDataAdd = function () {
  var count = Stations.find().count();
  if (count != 0) {
    return;
  }
  var data = [
    {
      code: 'a100', name: '中关村店', manager: '张建国',
      address: '北京海淀区中关村大街', comment: '以电子产品为主', memo: '重点'
    },
    {
      code: 'a119', name: '中关村二店', manager: '李伟民',
      address: '北京海淀区中关村大街', comment: '', memo: ''
    },
    {
      code: 'a128', name: '上海店', manager: '赵天地',
      address: '上海黄浦区', comment: '以手机产品为主', memo: '重点'
    },
    {
      code: 'a137', name: '广州店', manager: '钱玄黄',
      address: '广州市天河区', comment: '以手机产品为主', memo: '重点'
    },
    {
      code: 'a146', name: '海珠店', manager: '孙宇宙',
      address: '广州海珠区', comment: '以电子产品为主', memo: ''
    },
    {
      code: 'a155', name: '武昌店', manager: '周洪荒',
      address: '武汉市', comment: '以电子产品为主', memo: ''
    },
    {
      code: 'a164', name: '长沙店', manager: '吴日月',
      address: '长沙市', comment: '以手机产品为主', memo: ''
    },
    {
      code: 'a173', name: '天津店', manager: '郑盈亏',
      address: '天津市', comment: '以手机产品为主', memo: ''
    },
    {
      code: 'a182', name: '南昌店', manager: '张建国',
      address: '南昌市', comment: '', memo: ''
    },
    {
      code: 'a191', name: '南京店', manager: '张建国',
      address: '南京市', comment: '以电子产品为主', memo: '重点'
    },
    {
      code: 'a200', name: '东莞店', manager: '李伟民',
      address: '东莞市', comment: '以手机产品为主', memo: ''
    },
    {
      code: 'a219', name: '白云店', manager: '赵天梯',
      address: '广州市白云区', comment: '以通讯产品为主', memo: ''
    },
    {
      code: 'a228', name: '赛格店', manager: '刘日月',
      address: '深圳市罗湖区', comment: '以电子产品为主', memo: '重点'
    },
    {
      code: 'a237', name: '福田店', manager: '钱伟民',
      address: '深圳市福田区', comment: '以通讯产品为主', memo: ''
    },
    {
      code: 'a246', name: '龙华店', manager: '赵如意',
      address: '深圳市龙岗区', comment: '', memo: '试运行'
    },
    {
      code: 'a255', name: '宝安店', manager: '赵如意',
      address: '深圳市宝安区', comment: '以通讯产品为主', memo: '试运行'
    }
  ];

  for (var i = 0; i < data.length; i++) {
    data[i].timestamp = new Date(2015, 5 * Math.random(), 28 * Math.random());
    Stations.insert(data[i]);
  }

/*
  Stations.insert({
    code: 'a111', name: 'asdgasdga', manager: 'klwsdfa',
    address: 'gef2sfdsa', comment: 'gasdf asd', memo: 'asdgf'
  });
  Stations.insert({
    code: 'a112',
    name: 'assddga',
    manager: 'k23fa',
    address: 'g42sfdsa',
    comment: 'gaf asd',
    memo: 'asf'
  });
  Stations.insert({
    code: 'a113',
    name: 'asdga',
    manager: 'klwsdfa',
    address: 'gef2sfdsa',
    comment: 'f asd',
    memo: 'asdgf'
  });
  Stations.insert({
    code: 'a114',
    name: 'asdgga',
    manager: 'klwsdfa',
    address: 'gef2sfdsa',
    comment: 'gasd',
    memo: ''
  });
  Stations.insert({
    code: 'a115',
    name: 'f23dga',
    manager: 'wsdfa',
    address: 'gef2sfdsa',
    comment: 'gasdf asd',
    memo: 'asdgf'
  });
  Stations.insert({
    code: 'a116',
    name: 'asdg',
    manager: 'kdfa',
    address: 'ghrrd sa',
    comment: 'gsdfgasd',
    memo: ''
  });
  Stations.insert({
    code: 'a117',
    name: 'asdsdga',
    manager: 'klwsdfa',
    address: 'gef2sfdsa',
    comment: 'gasdf asd',
    memo: 'asdgf'
  });
  Stations.insert({
    code: 'a118',
    name: 'asdasdg',
    manager: 'kdfa',
    address: 'ghrrd sa',
    comment: 'gsdfgasd',
    memo: 'sd'
  });
  Stations.insert({
    code: 'a119',
    name: 'asdsdfg',
    manager: 'kdfa',
    address: 'ghrrd sa',
    comment: 'gsasd',
    memo: 'asdf'
  });
  Stations.insert({
    code: 'a120',
    name: 'asdscfg',
    manager: 'gsjkdfa',
    address: 'ghrrd sa',
    comment: 'gsdfgasd',
    memo: ''
  });
  Stations.insert({
    code: 'a121',
    name: 'asdsddg',
    manager: 'kddsdfa',
    address: 'ghrrd sdjsa',
    comment: 'gsdfgasd',
    memo: ''
  });
  Stations.insert({
    code: 'a122',
    name: 'asdsfljg',
    manager: 'kdf23cva',
    address: 'ghrrd sdfa',
    comment: 'gsdfga',
    memo: 'gdss'
  });
  Stations.insert({
    code: 'a123',
    name: 'assddg',
    manager: 'agsskdfa',
    address: 'ghrghxcjrd sa',
    comment: 'gsdfgasd',
    memo: 'g2'
  });
*/
};