// 存放所有mongodb数据库集合的数据结构或模式

// 消息格式
message = {
  // 创建者，手工创建消息的用户Id，或者触发产生自动消息的用户Id
  creatorId: String,
  // 接收者，如果一条消息有多个接收者，会为每个接收者创建一条消息
  receiverId: String,
  // 消息创建时间
  timestamp: Date,
  // 消息标题
  headline: String,
  // 消息内容
  content: String,
  // 优先级，范围：0 - 3，数字越大优先级越高，0优先级最低，3最高
  priority: Number,
  // 接收者是否已经阅读标记，false表示还未阅读
  read: Boolean,
  // 是否是手动创建，true表示由人工手动创建
  manual: Boolean
};

// 客户及其他人员信息格式
customer = {
  // 编号
  code: String,
  // 名称
  name: String,
  // 所在公司名称
  company: String,
  // 担任职务
  title: String,
  // 联系电话
  phone: String,
  // 通讯地址
  address: String,
  // 电子邮箱
  email: String,
  // 其他备忘信息
  memo: String,
  // 最近修改的时间
  timestamp: Date
};

// 企业或单位内部人员信息格式
employee = {
  // 编号
  code: String,
  // 名称
  name: String,
  // 担任职务
  title: String,
  // 联系电话
  phone: String,
  // 通讯地址
  address: String,
  // 电子邮箱
  email: String,
  // 所属销售分部Id，对应station集合的文档条目的数据库内部ObjectId
  stationId: String,
  // 员工工资
  salary: {
    // 工资数额
    value: Number,
    // 币种信息
    currency: String
  },
  // 其他备忘信息
  memo: String,
  // 最近修改的时间
  timestamp: Date
};

// 产品或货物格式
product = {
  // 编号，同款产品对应的唯一产品号
  code: String,
  // 名称
  name: String,
  // 型号
  model: String,
  // 对应数量
  quantity: Number,
  // 本批入库总价格，不一定等于销售价，包含价格数值和国际货币单位
  price: {
    // 价格数值
    value: Number,
    // 计价货币类型，比如CNY为人民币元，USD为美元，EUR为欧元，等等
    currency: String
  },
  // 入库时间
  timestamp: Date
};

// 销售团队/销售分部（或称仓库）信息格式
station = {
  // 编号
  code: String,
  // 名称
  name: String,
  // 所处位置
  address: String,
  // 当地主管人员
  manager: String,
  // 封存仓库，以后不再使用，true表示已封存
  frozen: Boolean,
  // 仓库情况简介
  comment: String,
  // 备忘信息
  memo: String
};

// 订单处理流程每步存储格式
process = {
  // 本步流程操作员
  operator: String,
  // 流程类型。询价，发货，收货，退货，付款，收款，退款，维修，报废
  type: String,
  // 本部流程操作内容或过程描述
  comment: String,
  // 涉及到的现金流Id，为集合capital文档条目的数据库内部ObjectId
  capitalId: String,
  // 产品出入库记录Id，为集合warehousing文档条目的数据库内部ObjectId
  deliveryId: String,
  // 本步流程涉及到的单据文件（如发票、收据、快递单等）的地址
  voucher: Array,
  // 本步流程创建时间
  timestamp: Date
};

// 订单格式
// 记录所有销售订单
order = {
  // 订单编号
  code: String,
  // 订单名称
  name: String,
  // 订单所属销售分部
  stationId: String,
  // 订单类型，sale表示销售订单，purchase表示采购订单
  type: String,
  // 客户Id，对应为customer集合的文档条目的数据库内部的ObjectId
  customerId: String,
  // 订单负责人账号Id
  managerId: String,
  // 订单说明
  comment: String,
  // 所隶属的父/母订单Id，为本order集合文档条目的数据库内部ObjectId
  parentId: String,
  // 订单流程步骤记录
  procedure: [process],
  // 订单状态，ongoing进行，finished为完成，canceled为取消
  status: String,
  // 订单创建时间
  timestamp: Date
};

// 库存记录格式
// 记录各地仓库产品库存信息
stock = {
  // 对应销售分部Id
  stationId: String,
  // 对应产品Id，为product集合的文档条目的数据库内部的ObjectId
  productId: String,
  // 该型号产品数量
  amount: Number,
  // 产品良好状态，good良好，repaired修复，defective次品，scrap报废
  status: String,
  // 最近修改时间
  timestamp: Date
};

// 产品出入库记录
// 凡是对仓库库存进行变更，都会产生本记录
delivery = {
  // 对应分部仓库Id，对应为station集合的文档条目的数据库内部的ObjectId
  stationId: String,
  // 出入库产品信息
  product: [
    {
      // 对应产品Id，为product集合的文档条目的数据库内部的ObjectId
      productId: String,
      // 产品数量
      amount: Number,
      // 相应产品唯一序列号列表
      sn: Array
    }
  ],
  // 操作类型, in表示入库，out表示出库，trim表示其他调整操作
  type: String,
  // 操作员账号Id
  operatorId: String,
  // 对应订单Id, 对应为order集合的文档条目的数据库内部的ObjectId
  orderId: String,
  // 出入库信息描述
  comment: String,
  // 操作时间
  timestamp: Date
};

// 现金库记录格式
// 每个销售分部的每种货币的现金对应一条记录，每张还未兑换的支票对应一条记录
cash = {
  // 类型：现金cash，支票cheque
  type: String,
  // 金额数值大小
  value: Number,
  // 货币类型
  currency: String,
  // 资金所属销售分部
  stationId: String,
  // 记录时间
  timestamp: Date
};

// 资金流转记录格式
// 凡涉及到有资金的收支，都会产生本记录
capital = {
  // 类型：
  // sale为销售，资金通常为正数，如果为负数，表示退货导致的退款
  // purchase为采购，资金通常为负数，如果为正数，表示因退货而退回的钱款
  // expense为日常开销，如办公费用，快递费，交通费等等
  // loan为员工预支的费用，需要单独归还或发工资时抵扣
  // wage为员工工资发放，自动抵扣预支工资（可手动取消）
  type: String,
  // 发生地点（销售分部）
  stationId: String,
  // 资金描述
  money: [
    {
      // 类型：现金cash，支票cheque
      type: String,
      // 数额：正数为收入，负数为支出
      value: Number,
      // 货币类型
      currency: String
    }
  ],
  // 资金来源或使用说明
  comment: String,
  // 资金来源或去处，可以是客户，也可以是员工（类型为loan或wage时）
  // 如果是客户，对应customer集合中文档条目的数据库内部ObjectId
  // 如果是员工，对应employee集合中文档条目的数据库内部ObjectId
  partnerId: String,
  // 对应订单Id, 对应为order集合的文档条目的数据库内部的ObjectId
  // 通过对应订单Id可以查到所有相关凭证，此处不再重复保存
  orderId: String,
  // 操作员
  operator: String,
  // 记录时间
  timestamp: Date
};

// 现金调整记录结构
// 用于支票兑换现金，不同币种间兑换，或不同销售分部间汇款
exchange = {
  // 兑换类型，cash为现金币种间兑换，cheque支票兑现，remittance分部间汇款
  type: String,
  // 兑换汇率，如果是支票兑换或汇款，则恒为1
  rate: Number,
  from: {
    // 待兑换的币种及金额，如果是多张支票，在支票的币种必须都相同
    value: Number,
    // 货币类型
    currency: String,
    // 货币支出的销售分部
    stationId: String
  },
  to: {
    // 兑换后得到的金额
    value: Number,
    // 货币类型
    currency: String,
    // 货币收入的销售分部
    stationId: String
  },
  // 兑换涉及到的支票存储位置
  voucher: Array,
  // 记录时间
  timestamp: Date
};

// 账号权限分配存储格式
permission = {
  // 用户账号Id，对应账号的数据库内部ObjectId
  userId: String,
  // 用户级别，分0-3共4级
  // 0为超级用户包所有权限，同时将忽略后面的stationId和privilege等设置
  // 1为特权用户，拥有除创建登录账号，不能创建销售分部和系统设置外的所有权限
  // 2为普通用户，由stationId和privilege指定在特定销售分部下的权限
  // 3为受限用户
  grade: Number,
  // 隶属销售分部，如果该属性值为空，表示不限于特定分部
  stationId: String,
  // 权限列表，crud四个字符分别表示增查改删的权限
  // 不是所有时候四个权限位都有意义，比如报表创建就只有'c'有意义
  // 对应属性值为数值，限制权限只应用在指定时间范围内
  // 数值大于0，表示对应数据从创建开始，指定时间段内可以修改
  // 数值小于0表示启用该权限且不限时间
  // 数值等于0表示禁用该权限
  privilege: {
    // 报表生成权限
    report: {
      tab1: {c: Number, r: Number, u: Number, d: Number},
      tab2: {c: Number, r: Number, u: Number, d: Number},
      tab3: {c: Number, r: Number, u: Number, d: Number}
    },
    // 手工创建消息对应的权限
    message: {c: Number, r: Number, u: Number, d: Number},
    // 订单创建及变更
    order: {c: Number, r: Number, u: Number, d: Number},
    // 流程处理权限
    process: {c: Number, r: Number, u: Number, d: Number},
    // 销售分部创建于维护
    //station: {c: Number, r: Number, u: Number, d: Number},
    // 产品型号维护权限
    product: {c: Number, r: Number, u: Number, d: Number},
    // 出入库权限
    delivery: {c: Number, r: Number, u: Number, d: Number},
    // 费用管理权限
    expense: {
      misc: {c: Number, r: Number, u: Number, d: Number},
      loan: {c: Number, r: Number, u: Number, d: Number},
      wage: {c: Number, r: Number, u: Number, d: Number}
    },
    // 现金流管理权限（如付款和收款等）
    capital: {c: Number, r: Number, u: Number, d: Number},
    // 支票及现金调整权限
    exchange: {c: Number, r: Number, u: Number, d: Number},
    // 客户名单管理权限
    customer: {c: Number, r: Number, u: Number, d: Number},
    // 员工名单管理权限
    employee: {c: Number, r: Number, u: Number, d: Number}
  }
};

// 系统设置
// 包含账号管理，权限设置，是否自动生成消息，自动消息配置（内容格式，发送目标）
// 默认创建账号，为最低级别，具有订单管理功能及相关功能（如收发货物货款等）
// 销售分部（或称销售团队、货仓等）的创建也隶属系统管理