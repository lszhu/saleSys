Template.rejectTable.onCreated(function() {
  Session.set('rejectTableSubmitErrors', {});
});

Template.rejectTable.helpers({
  hasError: function(field) {
    return !!Session.get('rejectTableSubmitErrors')[field] ? 'has-error' : '';
  },
  today: function() {
    return formatDate(new Date());
  }
});

Template.rejectTable.onRendered(function() {
  $('.deadline input[name=deadline]').datepicker({
    format: "yyyy-mm-dd",
    language: "zh-CN",
    orientation: 'top left',
    autoclose: true
  });
});

Template.rejectTable.events({
  'submit .createGrid': function(e) {
    e.preventDefault();
    var form = $('form.createGrid');
    var query = {
      deadline: form.find('[name=deadline]').val(),
      stationId: form.find('[name=stationId]').val(),
      filterKey: form.find('[name=keyword]').val()
    };
    query.deadline = query.deadline ? query.deadline : '';
    query.filterKey = query.filterKey ? query.filterKey : '';
    var target = $('.grid');
    var hot = orderDisposalDetailGoodsLists[0].hot;
    Meteor.call('rejectTable', query, function(err, result) {
      if (err) {
        return throwError('暂时无法生成报表');
      }
      hot.loadData(result);
      target.removeClass('hidden');
      hot.render();
    });
  }
});

Template.rejectGrid.onCreated(function () {
  var data = Template.currentData();

  var container = document.createElement('div');
  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: [
      '编号', '名称', '采购数量',
      '采购金额', '出货数量', '出货金额', '库存数量'
    ],
    //colWidths: [100, 100, 100, 100, 100, 100, 100],
    columns: [
      {}, {},
      {type: 'numeric'},
      {},
      {type: 'numeric'},
      {},
      {type: 'numeric'}
    ],
    stretchH: 'all',
    fixedColumnsLeft: 6,
    manualColumnResize: true,
    manualRowResize: true
  });

  orderDisposalDetailGoodsLists[0] = {
    data: data, container: container, hot: hot
  };
});

Template.rejectGrid.onRendered(function() {
  var container = orderDisposalDetailGoodsLists[0].container;
  $(container).appendTo($('.grid'));
});