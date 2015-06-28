Template.managerList.helpers({
  managers: function() {
    var data = Template.parentData();
    //console.log('stationId: ' + JSON.stringify(data && data.stationId));
    if (isAdministrator()) {
      return data.getManagers();
    } else {
      if (data && data._id) {
        return data.getManagers();
      } else {
        return [Meteor.user()];
      }
    }
  }
});

Template.managerList.onRendered(function() {
  /*
  var data = Template.parentData();
  //console.log('data: ' + JSON.stringify(data));
  if (isAdministrator() || !data || data && !data.managerId) {
    return;
  }
  // 非管理员登陆，只能显示当前登录者或者当前订单主管中的一个条目
  var manager = this.$('.manager-list [name=managerId]')[0];
  if (!manager) {
    return;
  }
  Meteor.call('getNameById', data.managerId, function(error, result) {
    if (!error) {
      //data.manager = result;
      //manager.val(result);
      manager.innerHTML = '<option value="' + data.managerId + '">' +
          result + '</option>';
      //console.log('manager: ' + JSON.stringify(data));
    } else {
      manager.innerHTML = '<option>未知</option>';
    }
  });
  */
});

Template.managerListItem.helpers({
  isSelected: function(v) {
    var u = Template.parentData().selection;
    console.log('selection: ' + JSON.stringify(u));
    return u == v ? 'selected' : '';
  }
});