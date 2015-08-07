Template.header.helpers({
  // 为当前选中的菜单DOM添加'active'类
  activeRouteClass: function (/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function (name) {
      return Router.current() && Router.current().route.getName() === name;
    });

    return active && 'active';
  },

  username: function() {
    var user = Meteor.user();
    return user && user.profile.name ? user.profile.name : '未授权';
  },

  // 为模板注入生成菜单需要的信息
  menuInfo: function () {
    return {
      message: {
        name: '工具',
        operation: [
          {name: '消息管理', template: 'messageApp'},
          {name: '出入库管理', template: 'deliveryApp'},
          {name: '资金收支管理', template: 'capitalApp'}
        ]
      },
      base: {
        name: '索引',
        operation: [
          {name: '客户信息', template: 'customerBase'},
          {name: '员工信息', template: 'employeeBase'},
          {name: '产品型号信息', template: 'productBase'},
          {name: '货币类型信息', template: 'currencyBase'}
        ]
      },
      order: {
        name: '订单',
        operation: [
          {name: '订单管理', template: 'orderManagement'},
          //{name: '查询与变更', template: 'queryOrder'},
          {name: '订单处理', template: 'orderDisposal'}
        ]
      },
      report: {
        name: '报表',
        operation: [
          {name: '库存汇总表', template: 'storeTable'},
          {name: '不良品分析', template: 'rejectTable'},
          {name: '订单汇总表', template: 'orderTable'},
          {name: '付款进度表', template: 'paymentTable'},
          {name: '资金汇总表', template: 'capitalTable'}
        ]
      },
      admin: {
        name: '系统管理',
        operation: [
          {name: '用户管理', template: 'accountAdmin'},
          {name: '权限管理', template: 'privilegeAdmin'},
          {name: '自动消息设置', template: 'monitorAdmin'},
          {name: '业务部管理', template: 'stationAdmin'}
        ]
      }
    };
  }
});
