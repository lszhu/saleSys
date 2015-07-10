// Local (client-only) collection
Errors = new Mongo.Collection(null);

throwError = function(message) {
  if (message) {
    Errors.insert({message: message});
  }
};

// 设置订单处理错误提示信息
signalOrderDisposalError = function(index, errors) {
  var data = Session.get('orderDisposalDetailSubmitErrors');
  if (isNaN(index) || index < 0) {
    return;
  }
  if (data.constructor.name != 'Array') {
    data = [];
  }
  data[index] = errors;
  Session.set('orderDisposalDetailSubmitErrors', data);
};
