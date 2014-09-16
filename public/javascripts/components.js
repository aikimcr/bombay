function ListSelector(params) {
  this.source_list = params.source;
  this.destination_list = params.destination;
  this.select_list = ko.observableArray();
  this.deselect_list = ko.observableArray();
  this.last_click = null;
  this.last_selected_range = [];
  this.class = params.class;
}

ListSelector.prototype.handleSourceOptionClick_ = function(data, event, element, context) {
  var selected_class = 'list_selector_selected';

  function changeClassList(el, set) {
    if (set) {
      el.classList.add(selected_class);
    } else {
      el.classList.remove(selected_class);
    }
  }

  if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
    var all_options = element.parentElement.children;

    for(var i = 0;i < all_options.length;i++) {
      all_options[i].classList.remove(selected_class);
    }
  }

  if (event.shiftKey && this.last_click !== null) {
    var all_options = element.parentElement.children;
    var idx = context.$index();
    var last_set = all_options[this.last_click].classList.contains(selected_class);

    this.last_selected_range.forEach(function(item) {
      changeClassList(item.element, item.was_set);
    });
    this.last_selected_range = [];

    if (idx > this.last_click) {
      for(var i = this.last_click;i <= idx;i++) {
        this.last_selected_range.push({
          element: all_options[i],
          was_set: all_options[i].classList.contains(selected_class)
        });
        changeClassList(all_options[i], last_set);
      }
    } else {
      for(var i = this.last_click;i >= idx;i--) {
        this.last_selected_range.push({
          element: all_options[i],
          was_set: all_options[i].classList.contains(selected_class)
        });
        changeClassList(all_options[i], last_set);
      }
    }
  } else {
    changeClassList(element, !element.classList.contains(selected_class));
    this.last_click = context.$index();
    this.last_selected_range = [];
  }
};

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
  viewModel: {
    createViewModel: function(params, componentInfo) {
      var ls = new ListSelector(params);
      return ls;
    }
  },
  template: [
    '<style>',
    '  list-selector {',
    '    display: block;',
    '    vertical-align: middle;',
    '  }',
    '  .list_selector {',
    '    display: inline-block;',
    '    vertical-align: middle;',
    '  }',
    '  .list_selector_control {',
    '    display: inline-block;',
    '    vertical-align: middle;',
    '    width: 45px;',
    '    height: 40px;',
    '  }',
    '  .list_selector_control > button {',
    '    display: block',
    '  }',
    '  .list_selector_list {',
    '    padding: 5px 10px 5px 10px;',
    '    margin: 5px 10px 5px 10px;',
    '    border-radius: 10px;',
    '    border-top: solid 5px;',
    '    border-bottom: solid 5px;',
    '    width: 290px;',
    '    height: 300px;',
    '    overflow-x: hidden;',
    '    overflow-y: auto;',
    '  }',
    '  .list_selector_option {',
    '    text-overflow: ellipsis;',
    '    overflow: hidden;',
    '    white-space: nowrap;',
    '  }',
    '  .list_selector_option.list_selector_selected:nth-child(odd):not(:hover) {',
    '    background-color: #7AA;',
    '  }',
    '  .list_selector_option.list_selector_selected:nth-child(even):not(:hover) {',
    '    background-color: #9CC;',
    '  }',
    '  .list_selector_option.list_selector_selected:hover {',
    '    background-color: #477;',
    '  }',
    '  .list_selector_option:hover {',
    '    color: #999;',
    '    background-color: #444;',
    '  }',
    '  .list_selector_option:nth-child(odd):not(:hover) {',
    '    background-color: #CCC;',
    '  }',
    '  .list_selector_option:nth-child(even):not(:hover) {',
    '    background-color: #FFF;',
    '  }',
    '</style>',
    '',
    '  <div class="list_selector">',
    '    <div class="list_selector_list list_selector_source" data-bind="foreach: source_list">',
    '      <div class="list_selector_option" data-bind="text: description, attr: { title: description, value: value }, click: function(data, event) { $parent.handleSourceOptionClick_(data, event, $element, $context); }"></div>',
    '    </div>',
    '  </div>',
    '  <div class="list_selector_control">',
    '    <button data-bind="click: moveToSelected">&gt;&gt;&gt;</button>',
    '    <button data-bind="click: moveToUnselected">&lt;&lt;&lt;</button>',
    '  </div>',
    '  <div class="list_selector list_selector_destination">',
    '    <div class="list_selector_list" data-bind="foreach: destination_list">',
    '      <div class="list_selector_option" data-bind="text: description, attr: { title: description }"></div>',
    '    </div>',
    '  </div>'
  ].join(' ')
};

ko.components.register('list-selector', list_selector);
