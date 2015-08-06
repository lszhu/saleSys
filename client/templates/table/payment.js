Template.paymentTable.onCreated(function() {
  Session.set('paymentTableSubmitErrors', {});
});

Template.paymentTable.helpers({
  hasError: function(field) {
    return !!Session.get('paymentTableSubmitErrors')[field] ? 'has-error' : '';
  },
  yearAgo: yearAgo,
  today: function() {
    return formatDate(new Date());
  }
});

Template.paymentTable.onRendered(function() {
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

Template.paymentTable.events({
  'submit .createGrid': function(e) {
    e.preventDefault();
    var form = $('form.createGrid');
    var query = {
      stationId: form.find('[name=stationId]').val(),
      type: form.find('[name=type]').val(),
      filterKey: form.find('[name=keyword]').val()
    };
    query.stationId = query.stationId ? query.stationId : '';
    var target = $('.grid');
    var hot = orderDisposalDetailGoodsLists[0].hot;
    Meteor.call('paymentTable', query, function(err, result) {
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

Template.paymentGrid.onCreated(function () {
  var data = Template.currentData();

  var container = document.createElement('div');
  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: [
      '单号', '部门','币种', '采购价', '销售价', '已结算', '待结算','完成率'
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

Template.paymentGrid.onRendered(function() {
  var container = orderDisposalDetailGoodsLists[0].container;
  $(container).appendTo($('.grid'));
  orderDisposalDetailGoodsLists[0].hot.render();
});

// 对应每种货币，销售订单和采购订单分别汇总为一条汇总记录
function summarize(data) {
  if (!data || data.constructor.name != 'Array') {
    return [[]];
  }

  var sumSale = {};
  var sumBuy = {};
  var tmp, i, len;
  for (i = 0, len = data.length; i < len; i++) {
    if (data[i][3]) {
      if (!sumBuy.hasOwnProperty(data[i][2])) {
        sumBuy[data[i][2]] = [0, null, 0];
      }
      tmp = sumBuy[data[i][2]];
      tmp[0] += data[i][3];
      tmp[2] += data[i][5];
    } else if (data[i][4]) {
      if (!sumSale.hasOwnProperty(data[i][2])) {
        sumSale[data[i][2]] = [null, 0, 0];
      }
      tmp = sumSale[data[i][2]];
      tmp[1] += data[i][4];
      tmp[2] += data[i][5];
    }
  }
  var result = [];
  for (i in sumBuy) {
    if (!sumBuy.hasOwnProperty(i)) {
      continue;
    }
    tmp = sumBuy[i];
    tmp[3] = tmp[0] - tmp[2];
    if (Math.abs(tmp[0])) {
      tmp[4] = tmp[2] / tmp[0];
    }
    tmp.unshift('<采购汇总>', '', i);
    result.push(tmp);
  }
  for (i in sumSale) {
    if (!sumSale.hasOwnProperty(i)) {
      continue;
    }
    tmp = sumSale[i];
    tmp[3] = tmp[1] - tmp[2];
    if (Math.abs(tmp[1])) {
      tmp[4] = tmp[2] / tmp[1];
    }
    tmp.unshift('<销售汇总>', '', i);
    result.push(tmp);
  }
  //console.log('result: ' + JSON.stringify(result));
  return result;
}