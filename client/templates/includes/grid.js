Template.goodsList.onCreated(function () {
  data = [
    ['2009', 'gadsd', 2941, 4303, 354, 'CNY', 'gasdfa'],
    ['2010', 'gdasf', 2905, 2867, 412, 'CNY', 'gdkwer'],
    ['2011', 'ghagd', 2517, 4822, 552, 'CNY', 'twefcsef'],
    ['2012', 'uiasg', 2422, 5399, 776, 'CNY', 'iwedfs']
  ];
  //Session.set('data', data);
  container = document.createElement('div');
  hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: [
      '编号', '名称', '数量',
      '单价', '总价', '货种', '序列号'
    ],
    //colWidths: [100, 100, 100, 100, 100, 100, 100],
    columns: [
      {}, {},
      {type: 'numeric'},
      {type: 'numeric', format: '0,0.00'},
      {type: 'numeric', format: '0,0.00'},
      {},
      {}//{renderer: 'safeHtmlRenderer'}
    ],
    stretchH: 'all',

    fixedColumnsLeft: 6,

    manualColumnResize: true,
    manualRowResize: true
  });

  //hot.setDataAtCell(0, 0, '+');

  //hot.addHook('afterLoadData', function() {
  //  hot.render();
  //})
});

Template.goodsList.onRendered(function () {

  // 准备订单处理中内嵌表格
  var up_container = this.find('.grid');
  up_container.appendChild(container);
  Handsontable.hooks.add('afterRender', function () {
    $('th > .relative > .colHeader.cornerHeader').text('+');
    console.log('render again');
  });
  Handsontable.hooks.add('modifyColWidth', function () {
    $('th > .relative > .colHeader.cornerHeader').text('+');
    //console.log('modify colWidth');
  });

  //hot.render();
  //var hot;
  //var data = Session.get('data');

  //Meteor.setTimeout(function() {
  //  hot.render();
  //}, 120);
  /*
   function bindDumpButton() {
   if (typeof Handsontable === "undefined") {
   return;
   }

   Handsontable.Dom.addEvent(document.body, 'click', function (e) {

   var element = e.target || e.srcElement;

   if (element.nodeName == "BUTTON" && element.name == 'dump') {
   var name = element.getAttribute('data-dump');
   var instance = element.getAttribute('data-instance');
   var hot = window[instance];
   console.log('data of ' + name, hot.getData());
   }
   });
   }

   //bindDumpButton();
   */
});

Template.goodsList.helpers({
  //hasError: function(field) {
  //  return !!Session.get('orderDisposalDetailSubmitErrors')[field] ?
  //      'has-error' : '';
  //},
});

Template.goodsList.events({

  // 用于给表格末尾添加新空行
  'click .goodsList': function(e) {
    var t = $(e.target);
    if (t.hasClass('colHeader') && t.hasClass('cornerHeader') ||
        t.children('.colHeader.cornerHeader').length) {
      console.log('click event');
      hot.alter('insert_row');
    }
  }
});