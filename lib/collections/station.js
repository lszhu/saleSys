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
    station = _.extend(station, {timestamp: new Date()});
    //var user = Meteor.user();

    var errors = validateStation(data);
    if (errors.err) {
      throw new Meteor.Error('invalid-station', getErrorMessage(errors));
    }

    // 更新条目情况的处理
    if (data.overlap) {
      Stations.update(data.overlap, station);
      return;
    } else {
      return Stations.insert(station);
    }
  },

  stationRemove: function (objectId) {
    check(objectId, String);
    Stations.remove(objectId);
  }
});

validateStation = function(data) {
  var station = data.station;
  var overlap = data.overlap;
  var errors = {};

  if (!station.code) {
    errors.code = '未输入编号';
    errors.err = true;
  }
  if (!station.name) {
    errors.name = '未输入名称';
    errors.err = true;
  }
  if (errors.err) {
    return errors;
  }
  var s = Stations.findOne({code: station.code});
  if (s && s._id != overlap) {
    errors.code = '已存在该部门编号';
    errors.err = true;
  }
  s = Stations.findOne({name: station.name});
  if (s && s._id != overlap) {
    errors.name = '已存在同名的部门';
    errors.err = true;
  }
  return errors;
};