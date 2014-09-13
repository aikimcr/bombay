function ListSelector(params) {
  this.source_list = params.source;
  this.destination_list = params.destination;
  this.select_list = ko.observableArray();
  this.deselect_list = ko.observableArray();
  this.class = params.class;
}

ListSelector.prototype.moveList_ = function(source, destination, control) {
  var i;
  while(i = control.shift()) {
    var rows = source.remove(function(item) {
      return item.value() == i;
    });

    var row;
    while(row = rows.shift()) {
      destination.push(row);
    }
  }
};

ListSelector.prototype.moveToSelected = function() {
  this.moveList_(
    this.source_list,
    this.destination_list,
    this.select_list
  );
};

ListSelector.prototype.moveToUnselected = function() {
  this.moveList_(
    this.destination_list,
    this.source_list,
    this.deselect_list
  );
};

var list_selector = {
  viewModel: ListSelector,
  template: [
    '<style>',
    '  list-selector {',
    '    display: block;',
    '    vertical-align: middle;',
    '  }',
    '  list-selector div {',
    '    display: inline-block;',
    '    vertical-align: middle;',
    '    width: 325px;',
    '    overflow: auto;',
    '  }',
    '  list-selector div.control {',
    '    display: inline-block;',
    '    vertical-align: middle;',
    '    width: 45px;',
    '    height: 40px;',
    '  }',
    '  list-selector div.control button {',
    '    display: block',
    '  }',
    '  list-selector div.selector select {',
    '    padding: 5px 10px 5px 10px;',
    '    margin: 5px 10px 5px 10px;',
    '    border-radius: 10px;',
    '    border-top: solid 5px;',
    '    border-bottom: solid 5px;',
    '    min-width: 300px;',
    '  }',
    '  list-selector div.selector select option:nth-child(odd) {',
    '    background-color: #CCC;',
    '  }',
    '</style>',
    '',
    '  <div class="selector">',
    '    <select data-bind="selectedOptions: select_list, options: source_list, optionsText: \'description\', optionsValue: \'value\'" size="10" multiple="true">',
    '    </select>',
    '  </div>',
    '  <div class="control">',
    '    <button data-bind="click: moveToSelected">&gt;&gt;&gt;</button>',
    '    <button data-bind="click: moveToUnselected">&lt;&lt;&lt;</button>',
    '  </div>',
    '  <div class="selector">',
    '    <select data-bind="selectedOptions: deselect_list, options: destination_list, optionsText: \'description\', optionsValue: \'value\'" size="10" multiple="true">',
    '    </select>',
    '  </div>'
  ].join(' ')
};

ko.components.register('list-selector', list_selector);
