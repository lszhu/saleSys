// 添加测试使用的订单集合（order）数据库条目，
orderTestDataAdd = function () {
  var data = [
    {
      code: '201403010001',
      type: '销售',
      status: '进行',
      customer: '肖大三',
      address: '北京西城区复兴路',
      phone: '12868285128',
      deadline: new Date('2014-08-22'),
      comment: '需要定制变更包装盒',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '备货',
          //operator: String,
          comment: '市场上没有太成熟的产品',
          voucher: [
            {name: '样品图片', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片2', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片3', path: '/data/voucher/2014/09/11/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-11')
        }
      ],
      timestamp: new Date('2014-03-22')
    },
    {
      code: '201404010001',
      type: '零售',
      status: '终止',
      customer: '蒋竹兰',
      address: '武汉中山路',
      phone: '13868385188',
      deadline: new Date('2014-04-01'),
      comment: '',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '备货',
          //operator: String,
          comment: '无库存，厂家不再生产',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-04-01')
        }
      ],
      timestamp: new Date('2014-04-01')
    },
    {
      code: '201404110001',
      type: '零售',
      status: '完成',
      customer: '蒋竹兰',
      address: '武汉中山路',
      phone: '13868385188',
      deadline: new Date('2014-04-11'),
      comment: '',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-04-11')
        }
      ],
      timestamp: new Date('2014-04-11')
    },
    {
      code: '201406010101',
      type: '销售',
      status: '完成',
      customer: '赵小梅',
      address: '上海黄浦区',
      phone: '18813585381',
      deadline: new Date('2014-11-21'),
      comment: '每个手机另配一张屏幕保护膜',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '备货',
          //operator: String,
          comment: '市场上没有太成熟的产品',
          voucher: [
            {name: '样品图片', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片2', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片3', path: '/data/voucher/2014/09/11/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-11')
        },
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '客户指定用EMS快递',
          voucher: [
            {name: '货款欠条', path: '/data/voucher/2014/09/15/'},
            {name: '快递单', path: '/data/voucher/2014/09/15/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-15')
        },
        {
          //operator: String,
          type: '收款',
          //operator: String,
          comment: '',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-21')
        }
      ],
      timestamp: new Date('2014-06-01')
    },
    {
      code: '201406010211',
      type: '销售',
      status: '进行',
      customer: '王成五',
      address: '北京东城区王府井',
      phone: '12868285128',
      deadline: new Date('2014-09-22'),
      comment: '需要定制变更包装盒',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '直接使用库存现货',
          voucher: [
            {name: '快递单', path: '/data/voucher/2014/09/11/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-08-23')
        },
        {
          //operator: String,
          type: '收款',
          //operator: String,
          comment: '市场上没有太成熟的产品',
          voucher: [
            {name: '样品图片', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片2', path: '/data/voucher/2014/09/11/'},
            {name: '样品图片3', path: '/data/voucher/2014/09/11/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-11')
        },
        {
          //operator: String,
          type: '收货',
          //operator: String,
          comment: '两台设备出现故障，需要保修',
          voucher: [
            {name: '故障显示图片', path: '/data/voucher/2014/10/11/'},
            {name: '故障显示图片2', path: '/data/voucher/2014/10/11/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-11')
        },
        {
          //operator: String,
          type: '维修',
          //operator: String,
          comment: '交全能维修中心老李维修',
          voucher: [
            {name: '维修单', path: '/data/voucher/2014/10/13/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-13')
        },
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-21')
        }
      ],
      timestamp: new Date('2014-06-01')
    },
    {
      code: '201409010001',
      type: '销售',
      status: '完成',
      customer: '肖江',
      address: '成都市复兴路',
      phone: '12868285128',
      deadline: new Date('2014-09-30'),
      comment: '需要定制变更包装盒',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '备货',
          //operator: String,
          comment: '部分配件需采购',
          voucher: [
            {name: '样品图片', path: '/data/voucher/2014/09/06/'},
            {name: '采购单1', path: '/data/voucher/2014/09/06/'},
            {name: '采购单2', path: '/data/voucher/2014/09/06/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-06')
        },
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '部分配件需采购',
          voucher: [
            {name: '发货快递单', path: '/data/voucher/2014/09/06/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-09-06')
        }
      ],
      timestamp: new Date('2014-09-01')
    },
    {
      code: '201410010001',
      type: '销售',
      status: '进行',
      customer: '成自强',
      address: '天津塘沽',
      phone: '13853216321',
      deadline: new Date('2014-12-01'),
      comment: '需要定制变更包装盒',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '备货',
          //operator: String,
          comment: '已无库存，从厂家提供需要两周，以下采购订单',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-01')
        },
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '',
          voucher: [
            {name: '发货快递单', path: '/data/voucher/2014/10/21/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-21')
        }
      ],
      timestamp: new Date('2014-10-01')
    },
    {
      code: '201410010002',
      type: '采购',
      status: '完成',
      customer: '陈晓菊',
      address: '深圳龙华坂田工业区',
      phone: '12868285128',
      deadline: new Date('2014-10-20'),
      comment: '需要定制变更包装盒',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '付款',
          //operator: String,
          comment: '供应商需要预付30%定金',
          voucher: [
            {name: '转账凭证', path: '/data/voucher/2014/10/02/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-02')
        },
        {
          //operator: String,
          type: '收货',
          //operator: String,
          comment: '货款全部结清',
          voucher: [
            {name: '付款收据', path: '/data/voucher/2014/10/15/'}
          ],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-10-02')
        }
      ],
      timestamp: new Date('2014-10-01')
    },
    {
      code: '201412010001',
      type: '零售',
      status: '完成',
      customer: '周天河',
      address: '广州天河区',
      phone: '18833449966',
      comment: '',
      //stationId: String,
      //managerId: String,
      procedure: [
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-12-01')
        },
        {
          //operator: String,
          type: '返修',
          //operator: String,
          comment: '电源失效',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-12-03')
        },
        {
          //operator: String,
          type: '报废',
          //operator: String,
          comment: '电源报废',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-12-05')
        },
        {
          //operator: String,
          type: '发货',
          //operator: String,
          comment: '更换电源',
          voucher: [],
          //capitalId: String,
          //deliveryId: String,
          timestamp: new Date('2014-12-08')
        }
      ],
      timestamp: new Date('2014-12-01')
    }
  ];
  var count = Orders.find().count();
  if (count != 0) {
    return;
  }
  for (var i = 0; i < data.length; i++) {
    //data[i].timestamp = new Date(2015, 4, 31 * Math.random());
    Orders.insert(data[i]);
  }
};