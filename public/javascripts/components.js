function ListSelector(params, componentInfo) {
  this.component_info = componentInfo;
  this.source_list = ko.observableArray(componentInfo.element.sourceList);
  this.destination_list = ko.observableArray(componentInfo.element.value);

  this.sort_reverse = !!params.sort_reverse;

  this.last_click = null;
  this.last_selected_range = [];

  var source_element = componentInfo.element.querySelector('.list_selector_source');
  source_element.addEventListener('change', function(e) {
    this.source_list(this.component_info.element.sourceList);
    this.destination_list(this.component_info.element.value)
  }.bind(this));

  setInterval(function() {
    this.source_list(this.component_info.element.sourceList);
    this.destination_list(this.component_info.element.value)
  }.bind(this), 500);
}

ListSelector.selected_class = 'list_selector_selected';;
ListSelector.prototype.handleOptionClick_ = function(data, event, element, context) {
  function changeClassList(el, set) {
    if (set) {
      el.classList.add(ListSelector.selected_class);
    } else {
      el.classList.remove(ListSelector.selected_class);
    }
  }

  if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
    var all_options = element.parentElement.children;

    for(var i = 0;i < all_options.length;i++) {
      all_options[i].classList.remove(ListSelector.selected_class);
    }
  }

  if (event.shiftKey && this.last_click !== null) {
    var all_options = element.parentElement.children;
    var idx = context.$index();
    var last_set = all_options[this.last_click].classList.contains(ListSelector.selected_class);

    this.last_selected_range.forEach(function(item) {
      changeClassList(item.element, item.was_set);
    });
    this.last_selected_range = [];

    if (idx > this.last_click) {
      for(var i = this.last_click;i <= idx;i++) {
        this.last_selected_range.push({
          element: all_options[i],
          was_set: all_options[i].classList.contains(ListSelector.selected_class)
        });
        changeClassList(all_options[i], last_set);
      }
    } else {
      for(var i = this.last_click;i >= idx;i--) {
        this.last_selected_range.push({
          element: all_options[i],
          was_set: all_options[i].classList.contains(ListSelector.selected_class)
        });
        changeClassList(all_options[i], last_set);
      }
    }
  } else {
    changeClassList(element, !element.classList.contains(ListSelector.selected_class));
    this.last_click = context.$index();
    this.last_selected_range = [];
  }
};

ListSelector.prototype.sortList_ = function(list) {
  var sorted_list = list().sort(function(a, b) {
    if ('sort_key' in a) {
      if ('sort_key' in b) {
        if (a.sort_key() < b.sort_key()) {
          return this.sort_reverse ? 1 : -1;
        } else if (a.sort_key() > b.sort_key()) {
          return this.sort_reverse ? -1 : 1;
        } else {
          return 0;
        }
      } else {
        return this.sort_reverse ? -1 : 1;
      }
    } else if ('sort_key' in b) {
      return this.sort_reverse ? 1 : -1;
    } else {
      return 0;
    }
  }.bind(this));

  list(sorted_list);
};

ListSelector.prototype.moveList_ = function(source, destination, event, selector) {
  var control_list = event
    .target
    .parentElement
    .parentElement
    .querySelector(selector)
    .children;

  var control = [];
  for(var i = 0; i < control_list.length; i++) {
    if (control_list[i].classList.contains(ListSelector.selected_class)) {
      var row_value = parseInt(control_list[i].attributes.getNamedItem('value').value, 10);
      control.push(row_value);
    }
  }

  var value;
  while(value = control.shift()) {
    var rows = source.remove(function(item) {
      return item.value() == value;
    });

    var row;
    while(row = rows.shift()) {
      destination.push(row);
    }
  }

  this.sortList_(source);
  this.sortList_(destination);
  this.component_info.element.value = destination();
  this.component_info.element.dispatchEvent(new Event('change'));
};

ListSelector.prototype.moveToDestination = function(data, event) {
  this.moveList_(
    this.source_list,
    this.destination_list,
    event,
    '.list_selector_source'
  );
};

ListSelector.prototype.moveToSource = function(data, event) {
  this.moveList_(
    this.destination_list,
    this.source_list,
    event,
    '.list_selector_destination'
  );
};

var list_selector = {
  viewModel: {
    createViewModel: function(params, componentInfo) {
      return new ListSelector(params, componentInfo);
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
    '    height: 170px;',
    '    overflow-x: hidden;',
    '    overflow-y: auto;',
    '  }',
    '  .list_selector_option, .list_selector_option::selection {',
    '    text-overflow: ellipsis;',
    '    overflow: hidden;',
    '    white-space: nowrap;',
    '  }',
    '  .list_selector_option.list_selector_selected:nth-child(odd):not(:hover), st_selector_option.list_selector_selected:nth-child(odd):not(:hover)::selection {',
    '    background-color: #7AA;',
    '  }',
    '  .list_selector_option.list_selector_selected:nth-child(even):not(:hover), st_selector_option.list_selector_selected:nth-child(even):not(:hover)::selection {',
    '    background-color: #9CC;',
    '  }',
    '  .list_selector_option.list_selector_selected:hover {',
    '    background-color: #477;',
    '  }',
    '  .list_selector_option:hover {',
    '    color: #999;',
    '    background-color: #444;',
    '  }',
    '  .list_selector_option:nth-child(odd):not(:hover), st_selector_option:nth-child(odd):not(:hover)::selection {',
    '    background-color: #CCC;',
    '  }',
    '  .list_selector_option:nth-child(even):not(:hover), st_selector_option:nth-child(even):not(:hover)::selection {',
    '    background-color: #FFF;',
    '  }',
    '</style>',
    '',
    '  <div class="list_selector">',
    '    <div class="list_selector_list list_selector_source" data-bind="foreach: source_list">',
    '      <div class="list_selector_option" data-bind="text: description, attr: { title: description, value: value }, click: function(data, event) { $parent.handleOptionClick_(data, event, $element, $context); }"></div>',
    '    </div>',
    '  </div>',
    '  <div class="list_selector_control">',
    '    <button data-bind="click: moveToDestination">&gt;&gt;&gt;</button>',
    '    <button data-bind="click: moveToSource">&lt;&lt;&lt;</button>',
    '  </div>',
    '  <div class="list_selector">',
    '    <div class="list_selector_list list_selector_destination" data-bind="foreach: destination_list">',
    '      <div class="list_selector_option" data-bind="text: description, attr: { title: description, value: value }, click: function(data, event) { $parent.handleOptionClick_(data, event, $element, $context); }"></div>',
    '    </div>',
    '  </div>'
  ].join(' ')
};

ko.components.register('list-selector', list_selector);

function DateSelector(params, componentInfo) {
  this.date = ko.observable(new Date(componentInfo.element.value));
  this.component_info = componentInfo;

  this.year = ko.computed({
    read: function() {
      return this.date().getFullYear();
    }.bind(this),
    write: function(value) {
      this.date().setFullYear(value);
      this.changeValue_();
    }.bind(this)
  });

  this.month = ko.computed({
    read: function() {
      return this.date().getMonth() + 1;
    }.bind(this),
    write: function(value) {
      this.date().setMonth(value - 1);
      this.changeValue_();
    }.bind(this)
  });

  this.day_of_month = ko.computed({
    read: function() {
      return this.date().getDate();
    }.bind(this),
    write: function(value) {
      this.date().setDate(value);
      this.changeValue_();
    }.bind(this)
  });

  this.days_in_month = ko.computed(function() {
    var work_date = new Date(this.date());
    work_date.setMonth(work_date.getMonth() + 1);
    work_date.setDate(0);
    var selector_list = [];
    for(var i=1; i <= work_date.getDate(); i++) {
      selector_list.push({label: i, value: i});
    }
    return selector_list;
  }.bind(this));

  setInterval(function() {
    this.date(new Date(this.component_info.element.value));
  }.bind(this), 500);
}

DateSelector.prototype.changeValue_ = function() {
  if (this.date() != 'Invalid Date') {
    this.component_info.element.value = new Date(this.date().toISOString().substr(0, 10));
    this.component_info.element.dispatchEvent(new Event('change'));
  }
};

var date_selector = {
  viewModel: {
    createViewModel: function(params, componentInfo) {
      return new DateSelector(params, componentInfo);
    }
  },
  template: [
    '<div class="date_selector">',
    '  <select data-bind="value: year">',
    '    <option value="2014">2014</option>',
    '    <option value="2015">2015</option>',
    '    <option value="2016">2016</option>',
    '  </select>',
    '  <select data-bind="value:month">',
    '    <option value="1">January(01)</option>',
    '    <option value="2">Februrary(02)</option>',
    '    <option value="3">March(03)</option>',
    '    <option value="4">April(04)</option>',
    '    <option value="5">May(05)</option>',
    '    <option value="6">June(06)</option>',
    '    <option value="7">July(07)</option>',
    '    <option value="8">August(08)</option>',
    '    <option value="9">September(09)</option>',
    '    <option value="10">October(10)</option>',
    '    <option value="11">November(11)</option>',
    '    <option value="12">December(12)</option>',
    '  </select>',
    '  <select data-bind="value: day_of_month, options: days_in_month, optionsText: \'label\', optionsValue: \'value\'"></select>',
    '</div>',
  ].join(' ')
};

ko.components.register('date-selector', date_selector);

ko.bindingHandlers.sourceList = {
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    element.sourceList = valueAccessor()();
    var source_element = element.querySelector('.list_selector_source');

    if (source_element) {
      source_element.dispatchEvent(new Event('change'));
    }
  }
};

function DropDownMenu(params, componentInfo) {
  this.component_info = componentInfo;
  this.top_element = this.component_info.element.querySelector('div.drop_down_menu');

  Object.keys(params).forEach(function(value) {
    if (value.match(/^\$/)) return;
    var option_div = document.createElement('div');
    var option_button = document.createElement('button');
    option_button.setAttribute('value', value);
    option_button.innerHTML = params[value];
    option_div.appendChild(option_button);
    this.top_element.appendChild(option_div);
  }.bind(this));

  var drop_down_element = this.component_info.element;

  this.handleSelect = function(event) {
    console.log(arguments);
    drop_down_element.value = event.target.value;
    var sel_evt = new Event('select');
    sel_evt.pageX = event.pageX;
    sel_evt.pageY = event.pageY;
    drop_down_element.dispatchEvent(sel_evt);
    drop_down_element.style.display = 'none';
  };

  this.top_element.addEventListener('click', this.handleSelect.bind(this));

  drop_down_element.show = function(event) {
    this.top_element.style.top = event.pageY.toString() + 'px';
    this.top_element.style.left = event.pageX.toString() + 'px';
    drop_down_element.style.display = 'block';
  }.bind(this);
}

var drop_down_menu = {
  viewModel: {
    createViewModel: function(params, componentInfo) {
      return new DropDownMenu(params, componentInfo);
    }
  },
  template: [
    '<style>',
    '  div.drop_down_menu {',
    '    color: black;',
    '    background-color: white;',
    '    position: absolute;',
    '    left: 0;',
    '    top: 0;',
    '    padding: 5px 10px 5px 10px;',
    '    border-style: solid;',
    '    border-color: black;',
    '    border-width: thin;',
    '    border-radius: 5px;',
    '    display: inline-block;',
    '  }',
    '  div.drop_down_menu div {',
    '    display: block',
    '  }',
    '  div.drop_down_menu td {',
    '    background-color: grey;',
    '    display: block;',
    '    border-style: solid;',
    '    border-color: white;',
    '    border-width: thin;',
    '    border-radius: 5px;',
    '  }',
    '  div.drop_down_menu button:hover {',
    '    background-color: lightgrey;',
    '    cursor: pointer;',
    '  }',
    '</style>',
    '',
    '<div class="drop_down_menu"></div>'
  ].join(' ')
};

ko.components.register('drop-down-menu', drop_down_menu);
