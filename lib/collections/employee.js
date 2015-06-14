Employees = new Mongo.Collection('employees');

Meteor.methods({
  employeeInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      employee: {
        code: String,
        name: String,
        sex: String,
        title: String,
        phone: String,
        email: String,
        stationId: String,
        salary: {
          value: Number,
          currency: String
        },
        memo: String
      },
      overlap: String
    });

    var employee = data.employee;
    //var user = Meteor.user();
    //var post = Posts.findOne(employeeAttributes.postId);

    if (!employee.code || !employee.name || !employee.phone) {
      throw new Meteor.Error('invalid-employee', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      employee = _.extend(employee, {timestamp: new Date()});
      Employees.update(data.overlap, employee);
      return;
    }

    // 创建新employee时，员工编号不能重复
    var exist = Employees.findOne({code: employee.code});
    if (exist) {
      throw new Meteor.Error('exist_employee', '员工编号重复');
    }

    employee = _.extend(employee, {timestamp: new Date()});

    // 新增employee条目
    employee._id = Employees.insert(employee);
    //employee._id = Employees.upsert({name: employee.name}, employee);

    return employee._id;
  },

  employeeRemove: function (objectId) {
    check(objectId, String);
    Employees.remove(objectId);
  }
});

validateEmployee = function(data) {
  var errors = {};
  var employee =  data.employee;
  var overlap = data.overlap;

  if (!employee.code) {
    errors.code = '编号未填写';
    errors.err = true;
  }
  if (!employee.name) {
    errors.name = '姓名未填写';
    errors.err = true;
  }
  if (!employee.phone) {
    errors.phone = '电话未填写';
    errors.err = true;
  }
  if (!employee.salary.value) {
    errors.salary = '工资未正确填写';
    errors.err = true;
  }
  if (!employee.salary.currency) {
    errors.currency = '货币类型未提供';
    errors.err = true;
  }
  if (errors.err) {
    return errors;
  }

  var e = Employees.findOne({code: employee.code});
  if (e && e._id != overlap) {
    errors.code = '已存在该员工编号';
    errors.err = true;
  }
  e = Employees.findOne({name: employee.name, phone: employee.phone});
  if (e && e._id != overlap) {
    errors.name = '已存在该员工';
    errors.err = true;
  }
  return errors;
};