Template.customerSelect.helpers({
  customers: function() {
    return Customers.find();
  }
});

Template.customerCombo.helpers({
  customers: function() {
    return Customers.find();
  }
});
