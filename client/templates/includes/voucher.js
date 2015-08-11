Template.voucherCombo.helpers({
  customers: function() {
    return Customers.find();
  }
});

Template.voucherCombo.events({
  'click .voucher-combo .tools': function(e, t) {
    e.preventDefault();

    var dialog = t.find('.addVoucher');
    $(dialog).modal('show');
  }
});