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
  'click .voucher-combo .tools': function(e, t) {
    e.preventDefault();

    var dialog = t.find('.addVoucher');
    $(dialog).modal('show');
  }
});

// 由日期参数返回年月字符串（yyyymm），否则返回'error'
function subPath(t) {
  if (!t) {
    return 'error';
  }
  var y = t.getFullYear() + '';
  var m = t.getMonth() + 1;
  m = m > 9 ? m : '0' + m;
  return y + m;
}