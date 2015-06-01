Products = new Mongo.Collection('products');

Meteor.methods({
  productInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      product: {
        code: String,
        name: String,
        model: String,
        batch: String,
        price: {value: Number, currency: String},
        comment: String,
        memo: String
      },
      overlap: String
    });

    var product = data.product;
    //var user = Meteor.user();

    if (!product.code || !product.name || !product.model) {
      throw new Meteor.Error('invalid-product', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      product = _.extend(product, {timestamp: new Date()});
      Products.update(data.overlap, product);
      return;
    }

    // 创建新product时，不允许覆盖已有同型号且同批次的条目
    var exist = Products.findOne({model: product.model, batch: product.batch});
    if (exist) {
      throw new Meteor.Error('exist_product', '已有同型号且同批次的产品型号');
    }

    product = _.extend(product, {timestamp: new Date()});

    // 新增product条目
    product._id = Products.insert(product);
    //product._id = Products.upsert({name: product.name}, product);

    return product._id;
  },

  productRemove: function (objectId) {
    check(objectId, String);
    Products.remove(objectId);
  }
});
