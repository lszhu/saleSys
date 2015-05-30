Stations = new Mongo.Collection('stations');

Meteor.methods({
  stationInsert: function (data) {
    //console.log('data: ' + JSON.stringify(data));
    check(data, {
      station: {
        code: String,
        name: String,
        manager: String,
        address: String,
        comment: String,
        memo: String
      },
      overlap: String
    });

    var station = data.station;
    //var user = Meteor.user();
    //var post = Posts.findOne(stationAttributes.postId);

    if (!station.code || !station.name || !station.manager) {
      throw new Meteor.Error('invalid-station', '录入信息不完整');
    }

    // 更新条目情况的处理
    if (data.overlap) {
      station = _.extend(station, {timestamp: new Date()});
      Stations.update(data.overlap, station);
      return;
    }

    // 创建新station时，不允许覆盖已有同名station
    var exist = Stations.findOne({name: station.name});
    if (exist) {
      throw new Meteor.Error('exist_station', '销售分部重名');
    }

    station = _.extend(station, {timestamp: new Date()});

    // 新增station条目
    station._id = Stations.insert(station);
    //station._id = Stations.upsert({name: station.name}, station);

    return station._id;
  },

  stationRemove: function (objectId) {
    check(objectId, String);
    Stations.remove(objectId);
  }
});
