// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
};

// 将出错信息逐个连接起来并返回
getErrorMessage = function(errors) {
  return _.chain(errors).omit('err').values().value().join('，');
};