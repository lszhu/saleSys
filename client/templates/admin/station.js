Template.station.helpers({
  temp: function() {}
});

Template.station.events({
  'keypress .station-keyword': function(e) {
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

  'click .filter-station': function(e) {
    e.preventDefault();
    var keyword = $('.station-keyword').val();
    keyword = keyword ? '?keyword=' + keyword : '';
    Router.go(location.pathname + keyword);
  },

  'click .edit-station': function(e) {
    e.preventDefault();
    $('#add-station').removeClass('hidden');
  },

  'submit .add-station': function(e) {
    e.preventDefault();

    var station = {
      code: $(e.target).find('[name=code]').val(),
      name: $(e.target).find('[name=name]').val(),
      manager: $(e.target).find('[name=manager]').val(),
      address: $(e.target).find('[name=address]').val(),
      comment: $(e.target).find('[name=comment]').val(),
      memo: $(e.target).find('[name=memo]').val()
    };
    console.log('station: ' + JSON.stringify(station));
    var overlap = $(e.target).find('[name=overlap]').prop('checked');
    console.log('overlap is: ' + overlap);
    Meteor.call('stationInsert', {station: station, overlap: overlap});
  }
});