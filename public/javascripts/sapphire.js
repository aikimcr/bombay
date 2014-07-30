function Sapphire(key) {
  this.key = key;
}

Sapphire.magnifying_glass = [
'  <g>',
'    <circle cx="6" cy="6" r="5" fill="#AAAAAA" stroke="#000000" stroke-width="2"></circle>',
'    <path fill="#AAAAAA" stroke="#000000" stroke-width="2" d="M10,10 L17,17"></path>',
'  </g>',
];

//'<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20">',
Sapphire.red_star = [
  '  <g class="currentLayer">',
  '    <path fill="#EB1A1A" fill-opacity="1" stroke="#000000" stroke-width="2" fill-rule="nonzero" d="M0.5,7.677793502807617 L8.055622100830078,7.677793502807617 L10.39037036895752,0.5 L12.725118637084961,7.677793502807617 L20.28074073791504,7.677793502807617 L14.168103218078613,12.113866806030273 L16.50296974182129,19.29166030883789 L10.39037036895752,14.855466842651367 L4.277731895446777,19.29166030883789 L6.612638473510742,12.113866806030273 L0.5,7.677793502807617 L0.5,7.677793502807617 z"></path>',
  '  </g>',
];

Sapphire.getNewContext = function(element, contextName, bindingContext) {
  if (bindingContext.$data[contextName] === undefined) {
    bindingContext.$data[contextName] = {};
  }

  var last_key = Object.keys(bindingContext.$data[contextName]).reduce(function(pk, k) {
    return Math.max(pk, parseInt(k, 16));
  }, 0);

  if (last_key == 0) last_key = parseInt('F0000000', 16);
  last_key++;
  var new_key = last_key.toString(16);
  var new_context = new Sapphire(new_key);

  element.setAttribute('context_name', contextName);
  element.setAttribute('context_key', new_key);

  new_context.createElement(
    'div',
    'select_element',
    {'with': contextName + '.' + new_key},
    {verticalAlign: 'top'}, null, null, element
  );

  bindingContext.$data[contextName][new_key] = new_context;

  return new_context;
};

Sapphire.getElementContext = function(element, bindingContext) {
  var context_name = element.getAttribute('context_name');
  var context_key = element.getAttribute('context_key');
  return bindingContext.$data[context_name][context_key];
}

Sapphire.prototype.createElement = function(tag_name, element_name, bind_options, style_options, classlist, other_attributes, parent) {
  var element = document.createElement(tag_name);

  function stringifyOptions(options, separator) {
    var options_strings = Object.keys(options).map(function(option_key) {
      return option_key + ': ' + options[option_key];
    });
    return options_strings.join(separator + ' ');
  }

  if (bind_options) element.setAttribute('data-bind', stringifyOptions(bind_options, ','));
  if (style_options) element.setAttribute('style', stringifyOptions(style_options, ';'));
  if (classlist) element.setAttribute('class', classlist.join(', '));

  if (other_attributes) {
    Object.keys(other_attributes).forEach(function(attribute) {
      element.setAttribute(attribute, other_attributes[attribute]);
    });
  }

  if (parent) parent.appendChild(element);
  this[element_name] = element;
  return element;
};

Sapphire.prototype.createSVGElement = function(element_name, width, height, svg_xml, style_options, classlist, parent) {
  var div = this.createElement(
    'div',
    element_name + '_div',
    null, style_options, null, null
  );

  div.innerHTML = [
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width=' + width + ' height=' + height + '>',
    svg_xml.join(''),
    '</svg>'
  ].join('');

  if (parent) parent.appendChild(div);
  return div;
};

Sapphire.searchableSelect = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var observable = valueAccessor();

    element.style.display = 'inline-block';
    element.classList.add('searchable_select');

    var search_object = Sapphire.getNewContext(element, 'searchable_select', bindingContext);
    var select_element = search_object.select_element;

    search_object.working_value = ko.observable(observable());
    search_object.select_filter_value = ko.observable('');
    search_object.select_list = ko.computed(function() {
      var options = allBindings.get('optionsList');
      var optionsText = allBindings.get('optionsText');
      var options_list = typeof options == 'function' ? options() : options;
      var filtered_options = options_list;

      if (this.select_filter_value()) {
        var match_text = this.select_filter_value()
          .toLowerCase()
          .replace(/(\W)/g, '\\$1');

        filtered_options = ko.utils.arrayFilter(options_list, function(item) {
          var item_accessor = item[optionsText];
          var item_text = typeof item_accessor == 'function' ? item_accessor() : item_accessor;
          item_text = item_text.toLowerCase();
          return item_text.match(match_text);
        });
      }

      return filtered_options;
    }.bind(search_object));

    search_object.change_filter_ = function(data, event) {
      if (allBindings.has('optionsCaption') &&
          data.select_list().length > 0 &&
          data.selector.selectedIndex == 0 &&
          data.select_filter_value()) {
        data.working_value(data.selector.options[1].value);
      }
    };

    search_object.blur_filter_ = function(data, event) {
      data.filter.style.display = 'none';
    };

    var filter = search_object.createElement(
      'input',
      'filter',
      {
        value: 'select_filter_value',
        valueUpdate: '\'afterkeydown\'',
        event: '{ keyup: change_filter_, blur: blur_filter_ }'
      },
      {display: 'none'},
      null, null, select_element
    );

    var selector_box = search_object.createElement(
      'div',
      'selector_box',
      selector_bind,
      null, null, null, select_element
    );
                     
    search_object.change_selector_ = function(data, event) {
      observable(data.working_value());
    };

    var selector_bind = {
      options: 'select_list',
      value: 'working_value',
      event: '{ change: change_selector_ }'
    };
    var selector_keys = ['optionsText', 'optionsValue', 'optionsCaption'];

    selector_keys.forEach(function(key) {
      if (allBindings.has(key)) {
        selector_bind[key] = '\'' + allBindings.get(key) + '\'';
      }
    });

    var selector = search_object.createElement(
      'select',
      'selector',
      selector_bind,
      {display: 'inline-block', maxWidth: '150px'},
      null, null, selector_box
    );

    var search_button = search_object.createSVGElement(
      'search_button', 18, 18,
      Sapphire.magnifying_glass, 
      {display: 'inline-block', 'vertical-align': 'middle'},
      null, selector_box
    );

    search_button.addEventListener('click', function(e) {
      var state = this.filter.style.display;

      if (state == 'none') {
        state = 'inline-block';
        this.filter.style.display = state;
        this.filter.focus(true);
      } else {
        state = 'none';
      }

      this.filter.style.display = state;
    }.bind(search_object));
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var observable = valueAccessor();
    Sapphire.getElementContext(element, bindingContext).working_value(observable());
  },
};
