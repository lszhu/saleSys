// 添加测试使用的销售分部（station）数据库条目，
stationTestDataAdd = function() {
  var count = Stations.find().count();
  if (count != 0) {
    return;
  }
  Stations.insert({
    code: 'a111',
    name: 'asdgasdga',
    manager: 'klwsdfa',
    address: 'gef2sfdsa',
    comment: 'gasdf asd',
    memo: 'asdgf'
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
}