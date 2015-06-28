Template.customerSelect.helpers({
  customers: function() {
    return Customers.find();
  }
});

Template.customerCombo.helpers({
  customers: function() {
    return Customers.find();
  },
  customerName: function() {
    var parentData = Template.parentData() || {};
    console.log('data in edit order: ' + JSON.stringify(parentData));
    if (parentData.customer) {
      var customer = Customers.findOne(parentData.customer);
      return customer && customer.name || parentData.customer;
    }
    return '';
  }
});

Template.customerCombo.events({
  'click .customer-combo a': function(e, t) {
    e.preventDefault();

    var customerId = $(e.target).attr('href');
    console.log('href: ' + customerId);
    var customer = Customers.findOne(customerId);
    t.$('.customer-combo [name=customerNameOrId]')
        .val(customer && customer.name)
        .data('customerId', customerId);
  }
});