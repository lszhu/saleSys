Template.employeeSelect.helpers({
  employees: function() {
    return Employees.find();
  }
});
