Template.voucherCombo.helpers({
  uploadInfo: function() {
    var data = this.orderInfo;
    if (!data) {
      return {};
    }
    data = _.pick(data, 'index', 'orderId');
    //console.log('order info: ' + JSON.stringify(data));
    var t = Orders.findOne(data.orderId);
    t = t && t.timestamp;
    //console.log('timestamp of order: ' + t);
    data = _.extend(data, {subPath: subPath(t)});
    //console.log('order info: ' + JSON.stringify(data));
    return data;
  },
  voucherList: function() {
    var data = this.orderInfo;
    console.log('disposal in voucherCombo: ' + JSON.stringify(data));
    return data && data.disposal && data.disposal.voucher || [];
  },
  customers: function() {
    return Customers.find();
  }
});

Template.voucherCombo.events({
  'click .voucher-combo .fa-trash-o': function(e) {
    e.preventDefault();
    e.stopPropagation();

    var data = Template.currentData().orderInfo;
    //console.log('order info is: ', data);
    var path = $(e.target).data('path');
    console.log('path: ' + path);
    var data = {
      orderId: data.orderId,
      index: data.index,
      path: path
    };
    Meteor.call('orderVoucherRemove', data);
  },
  'click .clear-voucher': function(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log('clear all vouchers');
  },
  'click .display-voucher': function(e, t) {
    e.preventDefault();
    e.stopPropagation();

    var filename = e.currentTarget.innerText;
    var order = Orders.findOne();
    var filePath = subPath(order && order.timestamp);
    var target = t.$('#display-voucher img');
    $(target).attr('src', '/server/voucher?name=/' + filePath + '/' + filename);
    $(t.$('#display-voucher')).modal('show');
  },
  'click .voucher-combo .tools': function(e, t) {
    e.preventDefault();

    var dialog = t.find('.addVoucher');
    $(dialog).modal('show');
  }
});

