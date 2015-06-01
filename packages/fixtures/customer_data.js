// 添加测试使用的内部员工信息（customer）数据库条目，
customerTestDataAdd = function () {
  var data = [
    {
      code: 'c001',
      name: '肖大三',
      company: '天地有限公司',
      title: '老板',
      phone: '12868285128',
      address: '北京西城区复兴路',
      email: 'zhangsan@sohu.com',
      memo: '代管仓库'
    },
    {
      code: 'c002',
      name: '蒋老四',
      company: '自在有限公司',
      title: '老板',
      phone: '128612128',
      address: '北京西城区复兴路',
      email: 'lisi@128.com',
      memo: ''
    },
    {
      code: 'c008',
      name: '王成五',
      company: '服装贸易公司',
      title: '老板',
      phone: '18988685128',
      address: '北京东城区王府井',
      email: 'wangwu@sohu.com',
      memo: ''
    },
    {
      code: 'c006',
      name: '赵小梅',
      company: '快乐大酒店',
      title: '老板',
      phone: '18988685128',
      address: '上海黄浦区',
      email: 'zhaomei@128.com',
      memo: '签约客户'
    },
    {
      code: 'c005',
      name: '蒋竹兰',
      company: '运动鞋有限公司',
      title: '老板',
      phone: '18972825128',
      address: '武汉中山路',
      email: 'qianlan@sohu.com',
      memo: '负责文书'
    },
    {
      code: 'c002',
      name: '周天河',
      company: '语音识别有限公司',
      title: '老板',
      phone: '18078285128',
      address: '广州天河区',
      email: 'zhouhuanghe@sohu.com',
      memo: ''
    },
    {
      code: 'c007',
      name: '陈晓菊',
      company: '手机设备厂',
      title: '前台',
      phone: '1887262588',
      address: '深圳龙华坂田工业区',
      email: 'chenqiuju@122.com',
      memo: ''
    },
    {
      code: 'c008',
      name: '成自强',
      company: '国际设备有限公司',
      title: '业务经理',
      phone: '18526815128',
      address: '天津塘沽',
      email: 'liuzizai@sohu.com',
      memo: '负责东北片区'
    },
    {
      code: 'c009',
      name: '肖江',
      company: '高精光学有限公司',
      title: '采购经理',
      phone: '18926822658',
      address: '成都市复兴路',
      email: 'zhangchangjiang@sina.com',
      memo: ''
    }
  ];
  var count = Customers.find().count();
  if (count != 0) {
    return;
  }
  for (var i = 0; i < data.length; i++) {
    data[i].timestamp = new Date(2015, 4, 31 * Math.random());
    Customers.insert(data[i]);
  }
}
;