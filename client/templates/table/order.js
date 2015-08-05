Template.orderTable.onCreated(function() {
  Session.set('orderTableSubmitErrors', {});
});

Template.orderTable.helpers({
  hasError: function(field) {
    return !!Session.get('orderTableSubmitErrors')[field] ? 'has-error' : '';
  },
  yearAgo: yearAgo,
  today: function() {
    return formatDate(new Date());
  }
});

Template.orderTable.onRendered(function() {
  $('.deadline input[name=start]').datepicker({
    format: "yyyy-mm-dd",
    language: "zh-CN",
    orientation: 'top left',
    autoclose: true
  });
  $('.deadline input[name=deadline]').datepicker({
    format: "yyyy-mm-dd",
    language: "zh-CN",
    orientation: 'top left',
    autoclose: true
  });
});

Template.orderTable.events({
  'submit .createGrid': function(e) {
    e.preventDefault();
    var form = $('form.createGrid');
    var query = {
      stationId: form.find('[name=stationId]').val(),
      type: form.find('[name=type]').val(),
      status: form.find('[name=status]').val(),
      filterKey: form.find('[name=keyword]').val(),
      start: form.find('[name=start]').val(),
      deadline: form.find('[name=deadline]').val()
    };
    query.start = query.start ? query.start : '';
    query.deadline = query.deadline ? query.deadline : '';
    query.stationId = query.stationId ? query.stationId : '';
    var target = $('.grid');
    var hot = orderDisposalDetailGoodsLists[0].hot;
    Meteor.call('orderTable', query, function(err, result) {
      if (err) {
        return throwError('暂时无法生成报表');
      }
      var sum = summarize(result);
      result = result.concat(sum);
      result.push([]);
      hot.loadData(result);
      target.removeClass('hidden');
      hot.render();
    });
  }
});

Template.orderGrid.onCreated(function () {
  var data = Template.currentData();

  var container = document.createElement('div');
  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: [
      '单号', '部门','币种', '采购支出', '其它支出', '收入', '净收入','收益率'
    ],
    //colWidths: [100, 100, 100, 100, 100, 100, 100],
    columns: [
      {}, {},
      {type: 'numeric', format: '0.00'},
      {type: 'numeric', format: '0.00'},
      {type: 'numeric', format: '0.00'},
      {type: 'numeric', format: '0.00'},
      {type: 'numeric', format: '0.00'},
      {type: 'numeric', format: '0.00%'}
    ],
    stretchH: 'all',
    fixedColumnsLeft: 5,
    manualColumnResize: true,
    manualRowResize: true
  });

  orderDisposalDetailGoodsLists[0] = {
    data: data, container: container, hot: hot
  };
});

Template.orderGrid.onRendered(function() {
  var container = orderDisposalDetailGoodsLists[0].container;
  $(container).appendTo($('.grid'));
  orderDisposalDetailGoodsLists[0].hot.render();
});

function summarize(data) {
  if (!data || data.constructor.name != 'Array') {
    return [[]];
  }

  var sum = {};
  var tmp, i, len;
  for (i = 0, len = data.length; i < len; i++) {
    if (!sum.hasOwnProperty(data[i][2])) {
      sum[data[i][2]] = [0, 0, 0];
    }
    tmp = sum[data[i][2]];
    tmp[0] += data[i][3];
    tmp[1] += data[i][4];
    tmp[2] += data[i][5];
  }
  var result = [];
  //console.log('sum: ' + JSON.stringify(sum));
  for (i in sum) {
    if (!sum.hasOwnProperty(i)) {
      continue;
    }
    tmp = sum[i];
    tmp[3] = tmp[2] - tmp[1] - tmp[0];
    tmp[4] = tmp[3] / (tmp[1] + tmp[0]);
    if (isNaN(tmp[4]) || tmp[4] == Infinity) {
      tmp[4] = '';
    }
    tmp.unshift('<汇总>', '', i);
    result.push(tmp);
  }
  //console.log('result: ' + JSON.stringify(result));
  return result;
}