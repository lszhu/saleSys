Template.header.helpers({
  activeRouteClass: function (/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function (name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  },

  menuInfo: function () {
    return {
      message: {
        name: '消息',
        operation: [
          {name: '创建', template: 'createMessage'},
          {name: '查询', template: 'queryMessage'}
        ]
      },
      base: {
        name: '索引',
        operation: [
          {name: '客户信息', template: 'customerBase'},
          {name: '员工信息', template: 'employeeBase'},
          {name: '产品型号信息', template: 'customerBase'}
        ]
      },
      order: {
        name: '订单',
        operation: [
          {name: '添加订单', template: 'createOrder'},
          {name: '查询与变更', template: 'queryOrder'},
          {name: '订单处理', template: 'disposeOrder'}
        ]
      },
      report: {
        name: '报表',
        operation: [
          {name: '库存汇总表', template: 'report'},
          {name: '不良品分析', template: 'report'},
          {name: '出入库记录', template: 'report'},
          {name: '订单汇总表', template: 'report'},
          {name: '资金汇总表', template: 'report'},
          {name: '资金收支表', template: 'report'},
          {name: '成本核算表', template: 'report'}
        ]
      },
      admin: {
        name: '系统管理',
        operation: [
          {name: '用户管理', template: 'userAdmin'},
          {name: '权限管理', template: 'privilegeAdmin'},
          {name: '消息设置', template: 'messageAdmin'},
          {name: '销售部管理', template: 'stationCreate'}
        ]
      }
    };
  }
});
