Stations = new Mongo.Collection('stations');

Meteor.methods({
  stationInsert: function (data) {
    //check(this.userId, String);
    //var station = data.station;
    console.log('data: ' + JSON.stringify(data));
    check(data, {
      station: {
        code: String,
        name: String,
        manager: String,
        address: String,
        comment: String,
        memo: String
      },
      overlap: Boolean
    });

    var station = data.station;
    //var user = Meteor.user();
    //var post = Posts.findOne(stationAttributes.postId);

    if (!station.code || !station.name || !station.manager) {
      throw new Meteor.Error('invalid-station', '录入信息不完整');
    }

    // 创建新station时，不允许覆盖已有同名station
    if (!data.overlap) {
      var exist = Stations.findOne({name: station.name});
      if (exist) {
        throw new Meteor.Error('exist_station', '销售分部重名');
      }
    }

    var station = _.extend(station, {
      timestamp: new Date()
    });

    // 新增或更新station条目
    station._id = Stations.upsert({name: station.name}, station);
    //station._id = Stations.insert(station);

    return station._id;
  }
});
