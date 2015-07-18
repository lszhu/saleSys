Deliveries = new Mongo.Collection('deliveries');

Meteor.methods({
  deliveryInsert: function(delivery) {
    check(delivery, {
      stationId: String,
      product: Array,
      type: String,
      operatorId: String,
      orderId: String,
      comment: String
    });
    var errors = validateDelivery(delivery);
    if (errors.err) {
      throw new Meteor.Error('invalid-delivery', getErrorMessage(errors));
    }
    delivery.product = trimGoodsList(delivery.product);
    delivery.timestamp = new Date();
    return Deliveries.insert(delivery);
  },

  deliveryUpdate: function(objectId, delivery) {
    check(objectId, String);
    check(delivery, {
      stationId: String,
      product: Array,
      type: String,
      operatorId: String,
      orderId: String,
      comment: String
    });
    var errors = validateDelivery(delivery);
    if (errors.err) {
      throw new Meteor.Error('invalid-delivery', getErrorMessage(errors));
    }
    delivery.product = trimGoodsList(delivery.product);
    // 更新时不更改时间戳
    //delivery.timestamp = new Date();
    return Deliveries.update(objectId, {$set: delivery});
  },

  deliveryRemove: function(objectId) {
    check(objectId, String);
    Deliveries.remove(objectId);
  }
});

validateDelivery = function(delivery) {
  var errors = {};

  if (!delivery.stationId) {
    errors.stationId = '无效的部门';
  }
  return errors;
};