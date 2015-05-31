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
