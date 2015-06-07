Template.station.helpers({
  temp: function () {
  }
});

Template.station.onRendered(function() {
  var key = this.data.filterKey;
  //console.log('key: ' + key);
  this.$('.station-keyword').val(key);
});

Template.station.events({
  'keypress .station-keyword': function (e) {
    // 绑定回车键
    if (e.keyCode == '13') {
      e.preventDefault();
      var keyword = $('.station-keyword').val();
      keyword = keyword ? '?keyword=' + keyword : '';
      //console.log('keyword: ' + keyword);
      //alert('contents: ' + $('.station-keyword').val());
      Router.go(location.pathname + keyword);
    }
  },

  'click .filter-station': function (e) {
    e.preventDefault();
    var keyword = $('.station-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-station': function (e) {
    e.preventDefault();
    var target = $('#add-station');
    // 如果设置了覆盖标识（overlap）则清空，否则只是简单的显示/隐藏切换编辑框
    if (target.find('[name=overlap]').val()) {
      target.find('[name=overlap]').val('');
    } else {
      target.toggleClass('hidden');
    }
    // 清空表单中填入的内容
    //clearForm(target);
    // 显示编辑框
    //target.removeClass('hidden');
  },

  'click .update-station': function(e) {
    e.preventDefault();
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    // 保存到隐藏的文本框，表示本次操作会强行覆盖对应的数据库条目
    $('#add-station').find('[name=overlap]').val(_id);
    // 显示编辑框
    $('#add-station').removeClass('hidden');
    fillForm(_id);
  },

  'click .remove-station': function(e) {
    e.preventDefault();
    if (!confirm('你确实要删除该销售分部的信息吗？')) {
      return;
    }
    // 获取对应数据库条目Id
    var _id = $(e.currentTarget).attr('href');
    //console.log('_id: ' + _id);
    Meteor.call('stationRemove', _id);
    // 清空覆盖（overlap）标识，用户点了'变更'后，又马上删除该条目就需要如下处理
    $('#add-station').find('[name=overlap]').val('');
  },

  'submit .add-station': function (e) {
    e.preventDefault();

    var form = $(e.target);
    var station = {
      code: form.find('[name=code]').val(),
      name: form.find('[name=name]').val(),
      manager: form.find('[name=manager]').val(),
      address: form.find('[name=address]').val(),
      comment: form.find('[name=comment]').val(),
      memo: form.find('[name=memo]').val()
    };
    //console.log('station: ' + JSON.stringify(station));
    var overlap = form.find('[name=overlap]').val();
    //console.log('overlap is: ' + overlap);
    Meteor.call('stationInsert', {station: station, overlap: overlap});
    // 最后清除表单的内容
    clearForm(e.target);
  }
});

function clearForm(target) {
  var form = $(target);
  form.find('[name=code]').val('');
  form.find('[name=name]').val('');
  form.find('[name=manager]').val('');
  form.find('[name=address]').val('');
  form.find('[name=comment]').val('');
  form.find('[name=memo]').val('');
  // 清空隐藏文本框中保存的数据库条目Id，即清空覆盖标识
  form.find('[name=overlap]').val('');
}

function fillForm(_id) {
  var data = Stations.findOne(_id);
  //console.log('data: ' + JSON.stringify(data));
  var form = $('#add-station');
  form.find('[name=code]').val(data.code);
  form.find('[name=name]').val(data.name);
  form.find('[name=manager]').val(data.manager);
  form.find('[name=address]').val(data.address);
  form.find('[name=comment]').val(data.comment);
  form.find('[name=memo]').val(data.memo);
}